/* Jeju Festa — zero-dependency Node backend
 * Static file server + JSON REST API + persistent storage (data/db.json).
 * Auth: scrypt-hashed passwords, random-token sessions. No npm packages. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const PUB = path.join(ROOT, "public");
const DB_PATH = path.join(ROOT, "data", "db.json");
const PORT = process.env.PORT || 8790;

/* ---------------- storage: Upstash Redis if configured, else local file ----------------
 * Persistent DB on any host by setting these env vars (never commit them):
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * Without them it falls back to data/db.json (fine locally; wiped on redeploy on free hosts). */
const REDIS_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const USE_REDIS = !!(REDIS_URL && REDIS_TOKEN);
const DB_KEY = "jeju:db";
const emptyDB = () => ({ users: {}, sessions: {}, checkins: [], reviews: [], subscribers: [], reports: [], views: 0 });

/* ---- owner email delivery ---- */
// Bug reports are stored in the DB and (best-effort) emailed to the owner.
const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.NEWSLETTER_TO || "yunseongkim@jejufesta.online";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
// If no RESEND key is configured, fall back to FormSubmit (a free form->email relay,
// no API key needed; the target address must confirm it once). Set OWNER_MAIL_RELAY="off" to disable.
const OWNER_MAIL_RELAY = process.env.OWNER_MAIL_RELAY || process.env.NEWSLETTER_RELAY || "formsubmit";
async function sendOwnerMail(subject, text, replyTo) {
  try {
    if (RESEND_API_KEY) {
      const payload = { from: "Jeju Festa <noreply@jejufesta.online>", to: [OWNER_EMAIL], subject, text };
      if (replyTo) payload.reply_to = replyTo;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) console.log("ownermail (resend) failed:", r.status, await r.text());
      return;
    }
    if (OWNER_MAIL_RELAY !== "off") {
      const body = { _subject: subject, message: text, _template: "table" };
      if (replyTo) body.email = replyTo;
      const r = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(OWNER_EMAIL), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) console.log("ownermail (formsubmit) failed:", r.status);
    }
  } catch (e) { console.log("ownermail notify error:", e.message); }
}
function notifyReport(message, email) {
  const subject = "제주 축제 도장 · 🐞 버그 신고";
  const text = `새로운 버그 신고가 접수되었습니다.\n\n내용:\n${message}\n\n회신 이메일: ${email || "(미입력)"}\n시간: ${new Date().toISOString()}\n\n— jejufesta.online`;
  return sendOwnerMail(subject, text, email || undefined);
}

async function redisGet(key) {
  const r = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } });
  if (!r.ok) throw new Error("redis get " + r.status);
  return (await r.json()).result;                       // string or null
}
async function redisSet(key, val) {
  const r = await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST", headers: { Authorization: `Bearer ${REDIS_TOKEN}` }, body: val });
  if (!r.ok) throw new Error("redis set " + r.status);
  return (await r.json()).result;
}

let DB = emptyDB();
async function loadDB() {
  if (USE_REDIS) {
    try { const v = await redisGet(DB_KEY); return v ? JSON.parse(v) : emptyDB(); }
    catch (e) { console.log("DB load (redis) failed:", e.message); return emptyDB(); }
  }
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { return emptyDB(); }
}
let saveTimer = null;
function saveDB() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (USE_REDIS) {
      try { await redisSet(DB_KEY, JSON.stringify(DB)); }
      catch (e) { console.log("DB save (redis) failed:", e.message); }
    } else {
      try { fs.mkdirSync(path.dirname(DB_PATH), { recursive: true }); fs.writeFileSync(DB_PATH, JSON.stringify(DB, null, 2)); }
      catch (e) { console.log("DB save (file) failed:", e.message); }
    }
  }, 200);
}

/* ---------------- festivals (source of truth) ---------------- */
const FESTIVALS = [
  {id:1,cat:"tradition",green:false,lat:33.5145,lng:126.5219,rate:4.5,stamp:"🎭",
   name:{ko:"탐라문화제",en:"Tamna Culture Festival"},
   loc:{ko:"제주시 일원 (탑동·원도심)",en:"Jeju City (Tapdong · old town)"},
   start:"2026-10-09",end:"2026-10-13",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"탐라 역사 재현과 퍼레이드, 전통예술 공연, 민속놀이 체험이 어우러진 제주 최대 전통문화 축제.",en:"Jeju's largest traditional festival — Tamna history reenactments, parades, folk arts and hands-on play."},
   sus:{ko:["다회용기 푸드존 운영","전통 공예 새활용 워크숍"],en:["Reusable-container food zone","Traditional-craft upcycling workshops"]}},
  {id:2,cat:"tradition",green:true,lat:33.3620,lng:126.3572,rate:4.4,stamp:"🔥",
   name:{ko:"제주 들불축제",en:"Jeju Deulbul (Fire) Festival"},
   loc:{ko:"새별오름 (제주시 애월읍)",en:"Saebyeol Oreum, Aewol, Jeju City"},
   start:"2026-03-13",end:"2026-03-15",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"목축문화에서 유래한 불의 축제. 오름 걷기와 공연, 지역 특산물 판매까지 최근 친환경 방식으로 운영.",en:"A fire festival from Jeju's grazing heritage — oreum walks, shows and local goods, now run eco-friendly."},
   sus:{ko:["친환경 운영 방식 전환","다회용기·셔틀버스 운영","쓰레기 분리배출 캠페인"],en:["Shift to eco-friendly operation","Reusable ware & shuttle buses","Waste-sorting campaign"]}},
  {id:3,cat:"agri",green:true,lat:33.1690,lng:126.2712,rate:4.3,stamp:"🌾",
   name:{ko:"가파도 청보리축제",en:"Gapado Green Barley Festival"},
   loc:{ko:"가파도",en:"Gapado Island"},
   start:"2026-04-18",end:"2026-05-10",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"청보리밭 걷기와 주민 공연, 로컬푸드와 특산물 판매가 있는 탄소중립 섬 축제.",en:"A carbon-neutral island festival — barley-field walks, resident shows and local food."},
   sus:{ko:["탄소중립 섬 지정","차 없는 도보 여행","주민 로컬푸드 장터"],en:["Carbon-neutral island","Car-free walking tour","Resident-run local market"]}},
  {id:4,cat:"agri",green:true,lat:33.2832,lng:126.6850,rate:4.2,stamp:"🌸",
   name:{ko:"의귀리 귤꽃축제",en:"Uigwi Tangerine Blossom Festival"},
   loc:{ko:"서귀포시 남원읍 의귀리",en:"Uigwi-ri, Namwon, Seogwipo"},
   start:"2026-05-08",end:"2026-05-10",
   verify:{ko:"티켓 사진 업로드",en:"Ticket photo upload"},
   desc:{ko:"하얀 귤꽃길 걷기와 감귤 체험, 농산물 직거래와 문화공연이 있는 마을 축제.",en:"A village festival of tangerine-blossom walks, citrus experiences, direct farm sales and shows."},
   sus:{ko:["농산물 직거래 장터","마을공동체 운영"],en:["Direct farm-to-table market","Community-run event"]}},
  {id:5,cat:"agri",green:true,lat:33.2385,lng:126.5970,rate:4.1,stamp:"🐟",
   name:{ko:"보목자리돔축제",en:"Bomok Damselfish Festival"},
   loc:{ko:"서귀포시 보목동",en:"Bomok-dong, Seogwipo"},
   start:"2026-05-22",end:"2026-05-24",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"자리돔 요리 시식과 맨손잡기 체험, 어촌문화 체험을 즐기는 로컬푸드 축제.",en:"A local-food festival with damselfish tastings, bare-hand catching and fishing-village culture."},
   sus:{ko:["제철 로컬 수산물 소비","어촌문화 체험"],en:["Seasonal local seafood","Fishing-village experiences"]}},
  {id:6,cat:"eco",green:true,lat:33.3100,lng:126.2300,rate:4.6,stamp:"✨",
   name:{ko:"청수곶자왈 반딧불이 축제",en:"Cheongsu Gotjawal Firefly Festival"},
   loc:{ko:"제주시 한경면 청수리",en:"Cheongsu-ri, Hangyeong, Jeju City"},
   start:"2026-06-12",end:"2026-06-21",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"곶자왈 숲의 반딧불이 탐사와 생태 해설, 환경교육이 있는 밤의 생태 축제.",en:"A night eco-festival — firefly walks through Gotjawal forest with guided ecology and education."},
   sus:{ko:["곶자왈 생태 보전","빛 공해 최소화 운영","생태 환경교육"],en:["Gotjawal ecosystem protection","Low light-pollution operation","Ecology education"]}},
  {id:7,cat:"leisure",green:false,lat:33.5200,lng:126.5960,rate:4.0,stamp:"🏖️",
   name:{ko:"삼양검은모래축제",en:"Samyang Black Sand Festival"},
   loc:{ko:"제주시 삼양해수욕장",en:"Samyang Beach, Jeju City"},
   start:"2026-07-17",end:"2026-07-19",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"검은모래 찜질 체험과 해변 프로그램, 지역 공연이 어우러진 여름 지역 축제.",en:"A summer community festival — black-sand therapy, beach programs and local performances."},
   sus:{ko:["해변 정화 프로그램","지역 공동체 운영"],en:["Beach cleanup program","Community-led event"]}},
  {id:8,cat:"eco",green:true,lat:33.4890,lng:126.4350,rate:4.4,stamp:"♻️",
   name:{ko:"월대천 축제",en:"Woldaecheon Stream Eco Festival"},
   loc:{ko:"제주시 외도동 월대천",en:"Woldaecheon, Oedo, Jeju City"},
   start:"2026-07-25",end:"2026-07-26",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"플로깅과 환경체험, 공연과 주민참여 프로그램을 담은 ESG 하천 축제.",en:"An ESG stream festival with plogging, hands-on eco activities, shows and resident programs."},
   sus:{ko:["플로깅·하천 정화","환경체험 프로그램","주민참여 ESG 운영"],en:["Plogging & stream cleanup","Eco-experience programs","Resident ESG participation"]}},
  {id:9,cat:"tradition",green:false,lat:33.4980,lng:126.4530,rate:4.1,stamp:"⛵",
   name:{ko:"이호테우축제",en:"Iho Teu Festival"},
   loc:{ko:"제주시 이호테우해수욕장",en:"Iho Tewoo Beach, Jeju City"},
   start:"2026-07-31",end:"2026-08-02",
   verify:{ko:"티켓 사진 업로드",en:"Ticket photo upload"},
   desc:{ko:"전통 뗏목배 '테우' 시연과 해양체험, 전통어업문화 체험을 즐기는 문화유산 축제.",en:"A heritage festival with 'teu' raft demos, marine experiences and traditional fishing culture."},
   sus:{ko:["전통어업 문화유산 계승","해양 체험 교육"],en:["Traditional fishing heritage","Marine experience education"]}},
  {id:10,cat:"leisure",green:false,lat:33.3240,lng:126.8380,rate:4.0,stamp:"🏝️",
   name:{ko:"표선해변 하얀모래축제",en:"Pyoseon White Sand Beach Festival"},
   loc:{ko:"서귀포시 표선해수욕장",en:"Pyoseon Beach, Seogwipo"},
   start:"2026-08-07",end:"2026-08-09",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"드넓은 백사장에서 즐기는 해변 체험과 문화공연, 가족 프로그램이 있는 여름 축제.",en:"A summer festival on the wide white beach — beach activities, culture shows and family programs."},
   sus:{ko:["해변 정화 캠페인","가족·공동체 프로그램"],en:["Beach cleanup campaign","Family & community programs"]}},
  {id:11,cat:"agri",green:false,lat:33.4580,lng:126.9330,rate:4.0,stamp:"🐚",
   name:{ko:"성산조개바당축제",en:"Seongsan Shellfish Bada Festival"},
   loc:{ko:"서귀포시 성산읍",en:"Seongsan-eup, Seogwipo"},
   start:"2026-08-14",end:"2026-08-16",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"조개잡이 체험과 해양문화 체험, 특산물 판매로 어촌 지역경제를 살리는 바다 축제.",en:"A seaside festival — clam digging, marine culture and local goods supporting the fishing economy."},
   sus:{ko:["로컬 수산물 직거래","어촌 지역경제 활성화"],en:["Local seafood direct sales","Boosting the fishing economy"]}},
  {id:12,cat:"leisure",green:false,lat:33.5160,lng:126.5310,rate:4.2,stamp:"🎨",
   name:{ko:"컬러풀 산지",en:"Colorful Sanji"},
   loc:{ko:"제주시 산지천·원도심",en:"Sanjicheon · old town, Jeju City"},
   start:"2026-08-28",end:"2026-09-06",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"산지천 원도심을 무대로 플리마켓과 전시, 공연, 원도심 투어가 열리는 도시재생 축제.",en:"An urban-regeneration festival along Sanjicheon — flea markets, exhibits, shows and old-town tours."},
   sus:{ko:["원도심 도시재생","지역 상권 활성화"],en:["Old-town regeneration","Supporting local businesses"]}},
  {id:13,cat:"leisure",green:false,lat:33.5120,lng:126.5250,rate:3.9,stamp:"🛍️",
   name:{ko:"탐나는전 원도심 문화행사",en:"Tamnaneunjeon Old-Town Culture Event"},
   loc:{ko:"제주시 원도심",en:"Old town, Jeju City"},
   start:"2026-09-04",end:"2026-09-06",
   verify:{ko:"티켓 사진 업로드",en:"Ticket photo upload"},
   desc:{ko:"플리마켓과 버스킹, 지역 상권 활성화 프로그램이 연중 열리는 원도심 문화행사.",en:"A recurring old-town culture event — flea markets, busking and programs energizing local commerce."},
   sus:{ko:["지역경제·도시재생","소상공인 상생 마켓"],en:["Local economy & regeneration","Small-business market"]}},
  {id:14,cat:"agri",green:true,lat:33.2120,lng:126.2510,rate:4.3,stamp:"🎣",
   name:{ko:"최남단 방어축제",en:"Southernmost Amberjack Festival"},
   loc:{ko:"서귀포시 대정읍 모슬포항",en:"Moseulpo Port, Daejeong, Seogwipo"},
   start:"2026-11-06",end:"2026-11-08",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"제철 방어 시식과 수산물 직거래, 어촌문화 체험이 있는 대표 수산업 축제.",en:"A flagship fisheries festival — seasonal amberjack tastings, direct seafood sales and village culture."},
   sus:{ko:["제철 로컬 수산물","수산물 직거래 장터"],en:["Seasonal local seafood","Direct seafood market"]}},
  {id:15,cat:"tradition",green:false,lat:33.4581,lng:126.9425,rate:4.6,stamp:"🌅",
   name:{ko:"성산일출축제",en:"Seongsan Sunrise Festival"},
   loc:{ko:"성산일출봉",en:"Seongsan Ilchulbong"},
   start:"2026-12-31",end:"2027-01-01",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"유네스코 성산일출봉에서 새해 해맞이와 전통공연, 소원기원 행사를 여는 문화관광 축제.",en:"A New-Year festival at UNESCO Seongsan Ilchulbong — sunrise, traditional shows and wish rituals."},
   sus:{ko:["공동체 해맞이 행사","자연유산 방문 예절 캠페인"],en:["Community sunrise event","Respect-the-heritage campaign"]}},
  {id:16,cat:"eco",green:true,lat:33.2560,lng:126.1800,rate:4.8,stamp:"🐬",
   name:{ko:"남방큰돌고래의 날",en:"Indo-Pacific Dolphin Day"},
   loc:{ko:"도구리알 공원",en:"Doguri-al Park"},
   start:"2026-07-12",end:"2026-07-12",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"돌고래 생태 해설과 플로깅, 비건 먹거리 마켓, 백일장과 팝업 책방·굿즈숍이 열리는 생태 축제.",en:"An eco-festival — dolphin ecology talks, plogging, a vegan food market, writing contest and pop-up book/goods shops."},
   sus:{ko:["남방큰돌고래 생태 보전","플로깅 해양정화","비건 먹거리 마켓"],en:["Indo-Pacific dolphin protection","Plogging cleanup","Vegan food market"]}},
  {id:17,cat:"agri",green:true,lat:33.3745,lng:126.7710,rate:4.7,stamp:"🌼",
   name:{ko:"서귀포유채꽃축제 (가시리)",en:"Seogwipo Canola Flower Festival (Gasiri)"},
   loc:{ko:"서귀포시 표선면 가시리 녹산로",en:"Noksan-ro, Gasiri, Pyoseon, Seogwipo"},
   start:"2026-03-28",end:"2026-04-12",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"녹산로 유채꽃길 걷기와 차 없는 거리, 원데이 클래스와 플리마켓, 버스킹과 지역 먹거리가 있는 농촌관광 축제.",en:"A rural-tourism festival — canola-road walks, a car-free street, one-day classes, a flea market, busking and local food."},
   sus:{ko:["차 없는 거리 운영","도보·자전거 이동 권장","지역 먹거리 로컬 소비"],en:["Car-free street","Walking & cycling encouraged","Local food consumption"]}},
  {id:18,cat:"eco",green:true,lat:33.2460,lng:126.4170,rate:4.5,stamp:"🌍",
   name:{ko:"환경 한마당 축제",en:"Environment Fair"},
   loc:{ko:"제주국제컨벤션센터 야외광장",en:"ICC Jeju outdoor plaza"},
   start:"2026-06-04",end:"2026-06-05",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"세계 환경의 날을 맞아 환경 체험·전시, 업사이클링, 녹색소비 한마당, 환경 인형극과 토크콘서트가 열리는 시민참여 축제.",en:"A World Environment Day fair — eco exhibits, upcycling, green-consumption market, a puppet show and talk concert."},
   sus:{ko:["자원순환·업사이클링 체험","녹색소비 한마당","시민참여 환경교육"],en:["Upcycling & circular economy","Green-consumption market","Citizen eco-education"]}}
];

const SEED_REVIEWS = {
  2:[{name:"불구경단",avatar:"🧗",rating:5,sustainability:4,text:{ko:"밤 불꽃 진짜 압도적이에요. 다회용기 운영도 좋았어요",en:"The night blaze is jaw-dropping, and the reusable ware was a nice touch"}}],
  6:[{name:"반디러버",avatar:"✨",rating:5,sustainability:5,text:{ko:"곶자왈 반딧불이 진짜 감동. 조명 최소화해서 더 좋았어요",en:"The Gotjawal fireflies were magical — low lighting made it even better"}}],
  16:[{name:"돌고래친구",avatar:"🐬",rating:5,sustainability:5,text:{ko:"돌고래 해설 유익하고 비건 마켓도 알찼어요. 플로깅도 참여!",en:"Great dolphin talk, solid vegan market, and I joined the plogging!"}},
      {name:"바다별",avatar:"🏄",rating:4,sustainability:5,text:{ko:"아이랑 오기 좋아요. 백일장도 재밌었어요",en:"Great with kids, the writing contest was fun too"}}],
  17:[{name:"유채러버",avatar:"🌴",rating:5,sustainability:4,text:{ko:"녹산로 유채꽃길 인생샷! 차 없는 거리라 걷기 편했어요",en:"Best canola-road photos, and the car-free street made walking easy"}}]
};

// tiny seeded PRNG so the monthly bot filler is deterministic within a month
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const SEED_BOTS = [
  {name:"한라산지기",avatar:"🧗",count:5},
  {name:"감귤요정",avatar:"🍊",count:4},
  {name:"바람의섬",avatar:"🏄",count:4},
  {name:"돌하르방",avatar:"🗿",count:3},
  {name:"플로깅러",avatar:"🚴",count:2},
  {name:"올레걷기",avatar:"🥾",count:2},
  {name:"해녀손녀",avatar:"🌊",count:1}
];

/* ---------------- helpers ---------------- */
function hashPw(pw, salt) {
  return crypto.scryptSync(pw, salt, 64).toString("hex");
}
function newId() { return crypto.randomBytes(8).toString("hex"); }
function sessionUser(req) {
  const auth = req.headers["authorization"] || "";
  const tok = auth.replace(/^Bearer\s+/i, "");
  const s = DB.sessions[tok];
  if (!s) return null;
  return DB.users[s.userId] || null;
}
function reviewsForFestival(fid) {
  const seed = (SEED_REVIEWS[fid] || []).map(r => ({ ...r, seeded: true }));
  const user = DB.reviews.filter(r => r.festivalId === fid);
  return [...user, ...seed];
}
/* check-in method per festival: geo (GPS) | qr (QR scan) | ticket (photo upload) */
const METHODS = {1:"geo",2:"qr",3:"geo",4:"ticket",5:"geo",6:"qr",7:"geo",8:"qr",9:"ticket",10:"geo",11:"qr",12:"geo",13:"ticket",14:"geo",15:"qr",16:"geo",17:"geo",18:"qr"};
function qrFor(id){ return "JEJU-" + id; }
function haversineKm(lat1, lng1, lat2, lng2){
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
const GEOFENCE_KM = 25; // lenient island-wide radius for demo

/* Real photos (한국관광공사 tong.visitkorea), official homepages, and detailed
 * descriptions researched for the curated festivals. Overlaid at serve time. */
const CURATED_EXTRA = {
  1: { img:"https://tong.visitkorea.or.kr/cms/resource/77/3559977_image2_1.jpg", homepage:"http://www.tamnafestival.kr/",
    desc:{ ko:"매년 가을(10월경) 제주시 탐라문화광장과 산지천 일대에서 열리는 제주 최대 규모의 전통문화 축제로, '1만 8천 신들의 고향'이라 불리는 제주의 신화·민속·예술을 한자리에서 만난다. 1962년 '제주예술제'로 시작해 60년 넘게 이어져 온 제주 대표 축제로, 탐라(제주)의 개벽 신화와 섬사람들의 삶을 오늘의 무대로 불러낸다.\n\n볼거리는 탐라개벽 신화를 재현한 개막 대행렬(거리 퍼레이드)과 큰굿 시연, 제주도민속예술축제(민속예술 경연), 해녀·심방(무당) 문화 공연이 중심이며, 칠머리당 영등굿 등 유네스코 인류무형문화유산과 맞닿은 프로그램도 만날 수 있다. 원도심 골목과 광장에서는 널뛰기·제기차기 같은 전통 놀이, 향토 먹거리 장터, 손으로 만들어 보는 공예 체험이 함께 열려 아이와 어른 모두 즐기기 좋다.\n\n사라져가는 제주어와 마을 공동체 문화를 지역민이 직접 잇고 다음 세대에 전승한다는 점에서, 자연 보전을 넘어 '문화의 지속가능성'을 보여주는 축제다. 💡 팁: 야간 개·폐막 퍼레이드가 하이라이트이며, 산지천 물빛과 어우러진 저녁 무대가 특히 아름답다.",
      en:"Held each autumn (around October) around Tamna Culture Plaza and the Sanjicheon stream in Jeju City, this is the island's largest traditional-culture festival — a gathering of the myths, folk arts and rituals of a place long called 'the home of 18,000 gods.' Begun in 1962 as the 'Jeju Arts Festival,' it has run for over 60 years, calling the creation myth of Tamna (old Jeju) and the life of its islanders onto today's stage.\n\nThe heart of it is an opening street parade re-enacting the Tamna creation myth, a 'keun-gut' shaman rite, the island's folk-arts competition, and haenyeo and shaman performances — plus programs tied to UNESCO intangible heritage such as the Chilmeoridang Yeongdeung-gut. Through the old-town alleys and squares you'll find traditional games like seesaw-jumping and jegi-chagi, a local-food market, and hands-on craft workshops the whole family can enjoy.\n\nBecause residents themselves keep the fading Jeju dialect and village-community culture alive and pass it to the next generation, it's a festival about the sustainability of culture, not just nature. 💡 Tip: the night opening and closing parades are the highlight — the evening stage mirrored in the Sanjicheon water is especially beautiful." } },
  2: { img:"https://tong.visitkorea.or.kr/cms/resource/15/4061015_image2_1.jpg", homepage:"https://firefestivaljeju.com/",
    desc:{ ko:"제주시 애월읍 봉성리 새별오름에서 이른 봄(보통 3월, 정월대보름 무렵)에 열리는 제주 대표 축제다. 예로부터 제주 사람들은 소·말을 놓아 기르던 중산간 초지의 해묵은 풀과 해충을 없애고 새 풀이 잘 돋도록 들판에 불을 놓았는데, 이 '방애(들불 놓기)'라는 목축 생활문화를 현대적인 축제로 되살린 것이 들불축제다.\n\n하이라이트는 축제 마지막 날 밤, 별 모양의 새별오름 사면 전체에 불을 놓아 거대한 불꽃이 밤하늘을 붉게 물들이는 '오름 불놓기'다. 이에 앞서 소원지 쓰기, 정월대보름 달집 만들기와 달집 태우기, 오름 도슨트 걷기, 듬돌 들기 같은 민속 체험이 이어지고, 본 무대에서는 주제공연·문화공연·먹거리 장터가 함께 펼쳐진다. 오름 정상에서 내려다보는 중산간의 탁 트인 풍광도 이 축제만의 매력이다.\n\n최근에는 대형 산불과 미세먼지·탄소 배출에 대한 우려를 반영해, 불의 규모와 방식을 조절하고 다회용기 사용·쓰레기 저감을 도입하는 등 운영을 친환경으로 전환하며 '지속가능한 불의 축제'로 거듭나고 있다. 💡 팁: 불놓기 시간대에는 인파와 교통이 몰리니 셔틀버스를 이용하고, 바람이 강한 오름 특성상 방한복을 꼭 챙기자.",
      en:"Held in early spring (usually March, around the first full moon) at star-shaped Saebyeol Oreum in Bongseong-ri, Aewol, this is one of Jeju's signature festivals. Islanders once set fire to the mid-mountain grazing fields to clear old grass and pests and help fresh grass grow for their cattle and horses; this herding-life tradition, called 'bangae,' is what the Fire Festival revives as a modern event.\n\nThe climax is 'oreum burning' on the final night, when the entire slope of Saebyeol Oreum is set alight and a vast wall of flame turns the night sky red. Leading up to it are wish-note writing, building and burning the full-moon 'daljip' tower, docent-guided oreum walks and folk games like stone-lifting, while the main stage brings theme and culture performances and a food market. The wide-open mid-mountain view from the summit is a charm unique to this festival.\n\nResponding to concerns over large wildfires, fine dust and carbon, it has recently gone greener — adjusting the scale and method of the fire and adding reusable containers and waste reduction — reinventing itself as a sustainable festival of fire. 💡 Tip: crowds and traffic peak at burn time, so take the shuttle bus, and pack warm clothes for the windy oreum." } },
  3: { img:"https://tong.visitkorea.or.kr/cms/resource/68/3543168_image2_1.jpg", homepage:"https://www.visitjeju.net/",
    desc:{ ko:"대정읍 모슬포항에서 배로 10여 분 거리, 위에서 보면 가오리를 닮은 탄소중립 섬 가파도에서 봄(4~5월)에 열리는 섬마을 축제다. 우리나라에서 가장 낮은 유인도(해발 20m대)답게 섬 전체가 평지여서, 봄바람에 일렁이는 드넓은 청보리밭이 섬을 초록 물결로 뒤덮는 풍경이 이 축제의 주인공이다.\n\n오르막이 거의 없어 1~2시간이면 걸어서 한 바퀴 도는 섬을 따라 청보리밭 사잇길 산책과 올레 10-1코스 걷기, 보물찾기, 주민들이 손수 준비한 야외공연과 해녀가 잡은 해산물·보리 먹거리를 즐길 수 있다. 낮은 돌담과 바다, 멀리 보이는 한라산과 산방산·마라도가 어우러진 풍경은 사진 명소로도 유명하다.\n\n가파도는 태양광 등 재생에너지로 전기를 충당하고 자동차 통행을 최소화한 '탄소중립 섬' 프로젝트의 무대로, 청보리 축제 역시 차 없는 도보 여행을 기본으로 한다. '느리게, 깨끗하게' 즐기는 대표적인 지속가능 여행지다. 💡 팁: 배편이 물때·기상에 따라 매진·결항되기 쉬우니 왕복 승선권을 미리 예약하고 일정을 넉넉히 잡자.",
      en:"A 10-minute ferry from Moseulpo Port in Daejeong, Gapado — a carbon-neutral island shaped like a stingray from above — hosts this village festival in spring (April–May). As Korea's lowest inhabited island (barely 20 m above sea level), it is almost entirely flat, so the star of the show is the vast field of green barley that turns the whole island into a rippling sea of green in the spring wind.\n\nThe island loops in an hour or two on foot, so visitors stroll the paths between barley fields, walk Olle Route 10-1, join a treasure hunt, and enjoy resident-run performances and food of barley and haenyeo-caught seafood. Low stone walls, the sea, and distant Hallasan, Sanbangsan and Marado make it a famous photo spot.\n\nGapado is the stage for a 'carbon-neutral island' project powered by solar and other renewables with car traffic minimized, and the barley festival is likewise built around car-free walking — a model destination for slow, clean, sustainable travel. 💡 Tip: ferries sell out or get cancelled with tides and weather, so book a round-trip ticket ahead and leave your schedule loose." } },
  4: { desc:{ ko:"감귤의 고장 서귀포 남원읍 의귀리에서, 온 마을이 하얀 귤꽃 향기로 뒤덮이는 5월에 열리는 마을 축제다. 가을·겨울의 노란 귤로만 알려진 감귤나무가 봄이면 순백의 꽃을 피운다는 사실을 아는 사람은 많지 않은데, 이 축제는 바로 그 짧고 향기로운 '귤꽃의 계절'을 주제로 삼는다.\n\n끝없이 이어진 귤꽃길을 걸으며 은은한 꽃향기를 맡고, 감귤밭에 들어가 보는 과수원 체험, 귤꽃차·귤꽃청 만들기, 마을에서 재배한 농산물과 감귤 가공품을 파는 직거래 장터, 주민들이 직접 무대에 서는 소박한 문화공연을 즐길 수 있다. 관광버스가 몰리는 대형 축제와 달리, 돌담과 귤밭 사이를 천천히 걷는 것만으로도 마음이 느긋해지는 곳이다.\n\n마을공동체가 손수 꾸리고 수익이 지역 농가로 돌아가는 구조라, 제주 농촌의 일상과 계절, 그리고 지역순환 경제를 가까이에서 느낄 수 있는 지속가능한 봄 축제다. 💡 팁: 귤꽃은 개화 기간이 짧으니 5월 중순의 만개 시기를 노리고, 향이 가장 진한 이른 아침에 걷는 것을 추천한다.",
      en:"In Uigwi-ri, a tangerine-farming village in Namwon, Seogwipo, this May festival fills the whole village with the scent of white citrus blossoms. Few realize that the trees known for their yellow autumn-winter fruit bloom pure white in spring — and this festival is built around exactly that brief, fragrant 'blossom season.'\n\nVisitors walk endless blossom-lined lanes drinking in the soft scent, step into the groves for orchard experiences, make citrus-blossom tea and syrup, browse a direct-from-farm market of local produce and tangerine goods, and enjoy modest performances by the residents themselves. Unlike big tour-bus events, here just strolling slowly between stone walls and groves is enough to ease your pace.\n\nBecause the community runs it themselves and the proceeds return to local farms, it's a sustainable spring festival that brings you close to everyday rural Jeju, its seasons, and a local circular economy. 💡 Tip: the bloom is short, so aim for peak around mid-May, and walk in the early morning when the fragrance is strongest." } },
  5: { img:"https://tong.visitkorea.or.kr/cms/resource/92/3550692_image2_1.jpg",
    desc:{ ko:"자리물회로 이름난 서귀포 보목동 보목포구에서, 손바닥만 한 바닷물고기 '자리돔'이 제철을 맞는 5~6월에 열리는 어촌 로컬푸드 축제다. 보목 앞바다는 예로부터 자리돔이 많이 나기로 유명해, '보목 사람은 자리물회 맛에 산다'는 말이 있을 만큼 자리돔이 마을의 자부심이자 생업이었다.\n\n갓 잡아 뼈째 썰어 된장·제피(초피)로 맛을 낸 시원한 자리물회와 노릇하게 구운 자리구이 시식이 대표 프로그램이고, 테우(뗏목배)를 타고 나가 전통 방식으로 자리를 뜨는 시연과 맨손으로 자리 잡기 체험, 해녀 물질 시연도 만날 수 있다. 어촌계와 해녀가 대를 이어 지켜온 바다살이 문화가 곳곳에 배어 있다.\n\n한라산을 병풍처럼 두르고 문섬·섶섬이 떠 있는 아름다운 포구에서, 그 지역·그 계절에 나는 것만 상에 올리는 '로컬·제철 밥상'은 그 자체로 지속가능한 식문화의 본보기다. 💡 팁: 자리물회는 호불호가 갈리니 자리구이와 함께 맛보고, 저녁 무렵 섶섬 너머로 지는 노을을 놓치지 말자.",
      en:"At Bomok Port in Bomok-dong, Seogwipo — famous for 'jari-mulhoe' cold fish soup — this fishing-village food festival lands in May–June when the palm-sized damselfish 'jari' are in season. Bomok's waters have always teemed with jari, so much so that locals say 'Bomok folk live for the taste of jari-mulhoe' — the fish is both the village's pride and its livelihood.\n\nThe signature programs are tastings of just-caught jari, sliced bone-in and seasoned with soybean paste and prickly-ash into a cool cold soup, and grilled jari, plus demonstrations of traditional netting from a log raft ('teu'), bare-hand fish-catching and haenyeo diving. The sea-living culture the fishers' cooperative and haenyeo have kept for generations runs through it all.\n\nSet in a lovely harbor framed by Hallasan with Munseom and Seopseom offshore, a 'local, in-season table' that serves only what that place and season provide is itself a model of sustainable food culture. 💡 Tip: jari-mulhoe is an acquired taste, so pair it with the grilled version, and don't miss the sunset over Seopseom at dusk." } },
  6: { desc:{ ko:"제주시 한경면 청수리의 원시림 곶자왈 일대에서, 초여름(6월경) 밤에만 만날 수 있는 반딧불이를 주인공으로 하는 생태 축제다. '곶자왈'은 나무·덩굴이 뒤엉킨 제주 특유의 원시 숲으로, 용암 위에 형성된 독특한 지형과 습한 미기후 덕분에 청정지역의 지표종인 반딧불이가 서식하는 몇 안 되는 보금자리다.\n\n프로그램은 철저히 밤 중심이다. 해가 지면 인공조명을 최소화한 칠흑 같은 어둠 속에서 초록빛으로 반짝이며 날아다니는 반딧불이 군무를 탐사하고, 곶자왈의 나무와 습지·용암지형, 반딧불이의 한살이를 배우는 해설사 동행 야간 탐방에 참여한다. 낮에는 곶자왈 생태 체험과 환경 교육 부스가 함께 운영된다.\n\n관람객 수를 제한하고 손전등·플래시 사용을 자제시키는 등 빛 공해를 줄이고 서식지를 보호하는 방식으로 운영되어, '자연을 소비하지 않고 지켜보는' 생태관광의 모범 사례로 꼽힌다. 반딧불이가 살 수 있는 청정 자연의 소중함을 몸으로 배우는 환경교육의 장이다. 💡 팁: 개최 기간이 2~3주로 짧고 인원이 조기 마감되니 예약은 필수, 밝은 옷과 향수·모기기피제(스프레이)는 피하고 긴팔을 입자.",
      en:"In the primeval Gotjawal forest of Cheongsu-ri, Hangyeong, Jeju City, this eco-festival stars fireflies that appear only on early-summer (around June) nights. 'Gotjawal' is Jeju's signature tangle of trees and vines grown over old lava; its unusual terrain and humid microclimate make it one of the few remaining havens for fireflies, an indicator species of truly clean habitat.\n\nEverything centers on the night. After sunset, in near-total darkness with lighting kept to a minimum, visitors trek to watch the fireflies' green shimmering dance and join guide-led night walks about Gotjawal's trees, wetlands and lava terrain and the firefly life cycle. By day there are Gotjawal ecology experiences and environmental-education booths.\n\nBy capping visitor numbers and discouraging flashlights to cut light pollution and protect the habitat, it stands as a model of ecotourism that 'watches nature without consuming it' — hands-on education about the clean nature fireflies need. 💡 Tip: it runs only 2–3 weeks and sells out early, so reserve ahead; skip bright clothing, perfume and spray repellent, and wear long sleeves." } },
  7: { img:"https://tong.visitkorea.or.kr/cms/resource/20/3039520_image2_1.jpeg",
    desc:{ ko:"규산염 광물이 섞여 햇빛에 반짝이는 검은 모래로 유명한 제주시 삼양동 삼양해수욕장에서 한여름(7~8월)에 열리는 해변 축제다. 화산섬 제주에서도 삼양의 모래는 유독 곱고 검어, 하얀 모래밭에 익숙한 방문객에게는 그 자체로 이색적인 풍경을 선사한다.\n\n대표 프로그램은 한낮의 태양에 뜨겁게 달궈진 검은 모래 속에 몸을 파묻는 '검은모래 찜질'이다. 원적외선이 나오는 이 모래찜질은 예로부터 신경통·관절염·비만에 좋다고 전해져, 여름이면 온몸에 모래를 덮고 누운 사람들로 해변이 가득 찬다. 여기에 맨발 걷기, 해변 물놀이와 가족 체험, 지역 주민의 공연과 먹거리 장터가 어우러진다.\n\n값비싼 시설 없이 제주가 품은 화산 지형과 바다라는 '자연 그대로의 자원'을 그대로 활용하는 소박한 축제라는 점에서, 지역이 가진 것을 지키며 즐기는 지속가능한 여름 나기의 한 모습을 보여준다. 💡 팁: 찜질은 오후 뙤약볕에 모래가 가장 뜨거울 때가 효과적이지만 화상에 주의하고, 물과 모자로 온열질환에 대비하자.",
      en:"At Samyang Beach in Samyang-dong, Jeju City — famed for black sand that glitters with silicate minerals in the sun — this seaside festival runs in midsummer (July–August). Even on volcanic Jeju, Samyang's sand is unusually fine and black, an exotic sight for visitors used to white beaches.\n\nThe signature program is 'black-sand bathing' — burying yourself in sand heated by the midday sun. Said to emit far-infrared rays, it has long been believed to ease neuralgia, arthritis and even obesity, and each summer the beach fills with people lying covered in sand. Add barefoot walking, water play and family activities, resident performances and a food market.\n\nBy using Jeju's volcanic terrain and sea 'as nature made them' rather than costly facilities, this humble festival shows one shape of a sustainable summer — enjoying what a place already has while protecting it. 💡 Tip: bathing works best when the afternoon sun makes the sand hottest, but mind burns, and bring water and a hat against heat illness." } },
  8: { desc:{ ko:"제주시 외도동을 흐르는 월대천 일대에서 열리는 ESG·환경 중심의 하천 축제다. 월대천은 한라산에서 흘러온 민물과 바닷물이 만나는 기수역으로, 수백 년 된 팽나무와 소나무가 물가에 늘어서 예로부터 선비들이 '달이 비치는 누대(月臺)'라 부르며 풍류를 즐기던 명소다. 은어가 올라오던 이 맑은 물길을 지키자는 취지에서 시작됐다.\n\n프로그램은 '즐기며 지킨다'는 콘셉트로 짜여 있다. 하천과 해안을 함께 걸으며 쓰레기를 줍는 플로깅, 물의 순환과 하천 생태를 배우는 환경체험 부스, 버려진 자원을 되살리는 업사이클링 만들기, 주민과 지역 예술가가 함께 꾸미는 공연과 야시장이 어우러진다. 아이와 함께 물가를 거닐며 참여하기 좋은 가족형 축제다.\n\n멀리 떠나지 않아도 되는 도심 속 하천을 무대로, 소비하는 축제가 아니라 자연을 돌보는 행동 자체가 프로그램이 되는 '지속가능한 놀이'를 경험할 수 있다. 💡 팁: 플로깅 참여자에게는 리유저블 컵·에코백 같은 친환경 기념품을 주는 경우가 많으니 챙겨보자.",
      en:"On and around the Woldaecheon stream in Oedo, Jeju City, this ESG-minded stream festival unfolds where freshwater from Hallasan meets the sea. Lined with centuries-old hackberry and pine trees, the spot was long a scenic retreat scholars called the 'moon-lit terrace (Woldae),' and the festival began from a wish to protect this clear waterway where sweetfish once ran.\n\nThe programs follow an 'enjoy while protecting' idea: plogging along the stream and coast, hands-on booths on the water cycle and stream ecology, upcycling workshops that revive discarded materials, and performances and a night market co-created by residents and local artists. It's a family-friendly festival, easy to join while strolling the water's edge with children.\n\nStaged on an in-city stream you needn't travel far to reach, it offers 'sustainable play' in which caring for nature is itself the program, not consumption. 💡 Tip: ploggers often receive eco souvenirs like reusable cups or tote bags, so keep an eye out." } },
  9: { img:"https://tong.visitkorea.or.kr/cms/resource/66/3354566_image2_1.jpg",
    desc:{ ko:"제주 시내에서 차로 15분, 가장 가까운 바다인 이호테우해변에서 여름에 열리는 전통어업문화 축제다. 해변 이름의 '테우'는 통나무 여러 개를 엮어 만든 제주 전통 뗏목배를 뜻하며, 방파제 끝에 마주 선 붉고 흰 조랑말 모양 등대가 이 해변의 상징이다.\n\n축제의 중심에는 밀물 때 들어온 물고기를 돌담 안에 가두었다가 썰물 때 맨손으로 잡던 제주 전통 어법 '원담(개막이)'이 있다. 복원한 원담과 갯벌에서 맨손 고기잡이·조개잡이 체험이 펼쳐지고, 테우를 타 보는 시연, 해녀 물질과 어촌 먹거리, 완만한 백사장과 소나무 숲을 무대로 한 물놀이·공연이 더해진다.\n\n그물과 동력선이 아니라 자연의 물때에 기대어 필요한 만큼만 잡던 원담·테우 어업은, 바다를 고갈시키지 않는 지속가능한 어로의 지혜 그 자체다. 사라져가는 제주 바닷사람들의 삶을 오늘에 되살리는 자리다. 💡 팁: 맨손잡기·조개잡이는 물때(썰물)에 맞춰 진행되니 프로그램 시간표를 미리 확인하고, 아이와 함께라면 아쿠아슈즈를 챙기자.",
      en:"A 15-minute drive from downtown Jeju to its nearest beach, Iho Tewoo Beach hosts this traditional-fishing festival in summer. The 'tewoo' in its name is Jeju's old log raft, and the red-and-white pony-shaped lighthouses facing off at the breakwater are the beach's emblem.\n\nAt its heart is 'wondam,' a traditional Jeju method of walling incoming fish behind stone weirs at high tide and catching them by hand at low tide. On restored wondam and tidal flats, visitors try bare-hand fishing and clam digging, watch tewoo raft demonstrations, and enjoy haenyeo diving, village food, and water play and performances on the gentle white sand and pine grove.\n\nRelying on nature's tides rather than nets and motors and taking only what was needed, wondam and tewoo fishing is itself the wisdom of sustainable harvesting that never drains the sea — and the festival brings the fading life of Jeju's sea people back to today. 💡 Tip: bare-hand catching and clam digging run on the tide (low water), so check the schedule ahead, and bring aqua shoes if you're with kids." } },
  10: { img:"https://tong.visitkorea.or.kr/cms/resource/01/3034601_image2_1.jpg",
    desc:{ ko:"서귀포시 표선면, 도내에서 가장 넓은 백사장(폭 약 313m)을 자랑하는 표선해수욕장에서 한여름에 열리는 해변 가족 축제다. 표선해변은 밀물과 썰물의 차가 커서, 썰물 때는 축구장 여러 개를 합친 듯한 둥근 백사장이 드러나고 밀물 때는 수심 얕고 잔잔한 에메랄드빛 원형 호수로 변하는 국내에서 보기 드문 지형을 지녔다.\n\n이 독특한 백사장을 무대로 모래조각·보물찾기 같은 해변 놀이, 갯벌 체험, 야외 문화공연과 버스킹, 아이와 함께 즐기는 가족 물놀이 프로그램이 이어진다. 물이 얕고 파도가 세지 않으며 모래가 곱고 완만해, 어린아이를 동반한 가족에게 특히 안전하고 편안한 물놀이 장소로 사랑받는다.\n\n인접한 제주민속촌과 연계해 제주 전통 마을 문화를 함께 체험할 수 있고, 자연이 스스로 만들어 낸 해변 지형을 그대로 살린 축제라는 점에서 지역 자원을 아끼며 즐기는 여름 축제의 좋은 예다. 💡 팁: 물이 차오르는 밀물 시간대가 물놀이에 가장 좋으니 그날의 물때를 확인하고 방문하자.",
      en:"In Pyoseon-myeon, Seogwipo, at Pyoseon Beach — home to the island's widest sand flat (about 313 m across) — this summer beach festival for families takes place. With its large tidal range, Pyoseon reveals a round sand plain the size of several football fields at low tide and turns into a shallow, calm emerald lagoon at high tide — terrain rarely seen in Korea.\n\nOn this unusual flat come beach play like sand sculpting and treasure hunts, tidal-flat experiences, outdoor performances and busking, and family water programs for children. Shallow water, gentle waves and fine, softly sloping sand make it a especially safe, easy spot beloved by families with young kids.\n\nLinked with the neighboring Jeju Folk Village, it lets you experience traditional village culture too, and by working with the beach terrain nature made on its own, it's a fine example of a summer festival that treasures local resources. 💡 Tip: the incoming high tide is best for playing in the water, so check that day's tide before you go." } },
  11: { desc:{ ko:"유네스코 세계자연유산 성산일출봉을 병풍처럼 곁에 둔 서귀포시 성산읍 앞바다에서 열리는 해양문화 축제다. 축제 이름에 쓰인 '바당'은 바다를 뜻하는 제주말로, 바다에 기대어 살아온 성산 사람들의 삶과 그 바다가 내어주는 먹거리를 주제로 삼는다.\n\n대표 프로그램은 물때에 맞춰 갯벌과 얕은 바다에 들어가 바지락·조개를 캐는 조개잡이 체험이다. 온 가족이 소쿠리를 들고 바다로 나가 직접 잡은 조개를 맛보는 재미가 이 축제의 백미이며, 여기에 해녀 물질 시연과 해산물 시식, 지역 수산물·특산물 직거래 장터, 어촌 마을 공연이 더해진다. 바로 곁에 성산일출봉·광치기해변이 있어 축제와 절경 관광을 함께 누릴 수 있다.\n\n마을 어촌계가 직접 운영해 수익이 지역으로 돌아가고, 잡는 양과 크기를 조절해 바다 자원을 지키며 즐기도록 설계돼 어촌 지역경제와 바다 생태를 함께 살리는 지속가능한 축제다. 💡 팁: 조개잡이는 반드시 썰물 시간에 열리니 물때표를 확인하고, 장화·목장갑·소쿠리를 준비하면 훨씬 편하다.",
      en:"In the waters off Seongsan-eup, Seogwipo — screened by UNESCO-listed Ilchulbong — this marine-culture festival takes its name from 'badang,' Jeju dialect for the sea. Its theme is the life of Seongsan's people, who have always leaned on the sea, and the food that sea provides.\n\nThe signature program is clam digging — wading onto the flats and shallows at the right tide to gather clams. The joy of whole families heading out with baskets and tasting what they catch is the highlight, joined by haenyeo diving demonstrations, seafood tastings, a direct market of local seafood and specialties, and village performances. With Ilchulbong and Gwangchigi Beach right beside it, you can pair the festival with stunning scenery.\n\nRun by the village fishers' cooperative so proceeds stay local, and designed to limit the catch's amount and size, it protects marine resources while people enjoy them — a sustainable festival that revives both the fishing economy and the sea's ecology. 💡 Tip: clam digging runs only at low tide, so check the tide table and bring boots, work gloves and a basket to make it far easier." } },
  12: { img:"https://tong.visitkorea.or.kr/cms/resource/22/3529822_image2_1.jpg",
    desc:{ ko:"제주시 원도심을 가로질러 바다로 흐르는 산지천 일대를 무대로 늦여름에서 초가을에 열리는 도시재생·문화 축제다. 산지천은 한때 옛 제주읍성 사람들의 식수원이자 빨래터·포구였지만 도시가 커지며 복개되어 잊혔다가, 복원 사업을 거쳐 다시 맑은 물이 흐르는 도심 하천으로 되살아났다. 그 물길 위에서 '도시가 다시 사는' 이야기를 담는다.\n\n산지천 양옆으로 수공예·빈티지 플리마켓과 지역 작가 전시, 버스킹과 야간 공연, 푸드트럭이 늘어서고, 오래된 여관·목욕탕·상점을 개조한 원도심 골목을 걷는 도보 투어로 동네의 시간을 새롭게 만난다. 밤이면 물빛에 조명이 어리는 산지천 야경이 특히 아름다워 젊은 세대에게 인기다.\n\n쇠락하던 원도심에 색과 활기를 더해 오래된 건물을 부수는 대신 고쳐 쓰고, 지역 상권과 청년 예술가를 잇는다는 점에서 '도시의 지속가능성(도시재생)'을 보여주는 축제다. 💡 팁: 걷기 좋은 저녁 시간에 방문해 산지천 야경과 인근 동문시장 먹거리를 함께 즐겨 보자.",
      en:"Set along the Sanjicheon, a stream that runs through Jeju City's old town to the sea, this urban-regeneration culture festival runs from late summer into early autumn. Once the drinking source, washing place and harbor of the old fortress town, Sanjicheon was culverted and forgotten as the city grew, then restored into a clear downtown stream again — and on that water the festival tells a story of a city coming back to life.\n\nBoth banks fill with handcraft and vintage flea markets, exhibitions by local artists, busking, night performances and food trucks, while walking tours through alleys of old inns, bathhouses and shops repurposed anew let you meet the neighborhood's layered time. By night the stream lit with reflected light is especially lovely, drawing younger crowds.\n\nBy adding color and life to a fading downtown — mending old buildings instead of tearing them down and reconnecting local businesses with young artists — it embodies the sustainability of a city itself (urban regeneration). 💡 Tip: come in the walkable evening to enjoy the night view and the food of nearby Dongmun Market together." } },
  13: { desc:{ ko:"제주시 원도심 곳곳에서 연중 비정기적으로 열리는 지역경제·도시재생형 문화행사다. 이름 '탐나는전'에는 탐라(제주)의 매력과 지역 상점(店)을 잇고 '탐나는(갖고 싶은)' 물건과 이야기를 나눈다는 중의적 의미가 담겨 있다.\n\n큰 축제장을 따로 짓는 대신, 원도심의 골목·광장·비어 있던 점포가 그대로 무대가 된다. 수공예·리사이클 소품을 파는 플리마켓, 청년 창작자와 로컬 브랜드의 팝업, 버스킹과 소규모 공연, 오래된 가게를 다시 찾게 하는 상권 활성화 프로그램이 이어진다. 크고 화려한 무대 대신, 걷다가 우연히 마주치는 작은 공연과 가게들이 이 행사의 매력이다.\n\n외부 대형 자본이 아니라 지역 소상공인과 청년 예술가가 주인공이 되어 원도심에 사람과 돈이 다시 돌게 한다는 점에서, 지역 순환경제와 도시재생을 지향하는 지속가능한 문화행사다. 💡 팁: 일정이 유동적이니 방문 전 제주 원도심(관덕정·칠성로 일대) 행사 공지를 확인하고, 소상공인 가게에서 소비하는 것 자체가 축제 참여가 된다.",
      en:"Held on and off through the year across Jeju City's old town, this is a regeneration-focused culture event. Its name, 'Tamnaneunjeon,' plays on two meanings — linking the charm of Tamna (Jeju) with local shops, and sharing 'covetable' goods and stories.\n\nRather than building a separate festival ground, the old town's alleys, squares and once-empty storefronts become the stage. Flea markets of handcraft and recycled goods, pop-ups by young makers and local brands, busking and small performances, and programs to draw people back to old shops all unfold. The charm is not big flashy stages but the small performances and shops you stumble on while walking.\n\nBecause local small businesses and young artists — not outside big capital — are the leads, drawing people and money back into downtown, it's a sustainable event aimed at a local circular economy and urban regeneration. 💡 Tip: dates vary, so check old-town (Gwandeokjeong / Chilseong-ro) notices before visiting — and simply spending at the small shops is itself joining in." } },
  14: { desc:{ ko:"우리나라 최남단, 서귀포시 대정읍 모슬포항에서 제철 방어가 가장 살이 오르는 11월에 열리는 대표 수산업 축제다. 모슬포 앞바다는 마라도·가파도로 이어지는 청정 해역이자 물살이 세기로 이름난 곳으로, 이 거친 물살에서 자란 '모슬포 방어'는 살이 단단하고 기름져 겨울 최고의 횟감으로 손꼽힌다.\n\n축제의 중심은 갓 잡아 올린 방어를 시중보다 저렴하게 맛보는 방어 시식·판매와 수산물 직거래 장터다. 대방어 한 마리를 부위별로 맛보는 재미와 함께, 맨손으로 방어를 잡는 이색 체험, 방어 경매 시연, 어촌 문화공연과 노래자랑이 어우러져 항구 전체가 잔치판이 된다. 방어회·방어조림·방어구이까지 다양한 방어 요리를 한자리에서 즐길 수 있다.\n\n제철에 그 지역에서 가장 많이 나는 생선을 앞세워 지역 어민의 소득과 겨울 관광을 함께 살리는, 서귀포의 겨울을 대표하는 미식 축제다. 💡 팁: 방어는 클수록(대방어) 기름지고 맛있으니 일행이 여럿이면 대방어 한 마리를 부위별로 나눠 먹는 것을 추천한다.",
      en:"At Moseulpo Port in Daejeong-eup, Seogwipo — Korea's southernmost point — this flagship fisheries festival lands in November when amberjack are at their fattest. Moseulpo's waters, running out to Marado and Gapado, are famously strong-currented, and the 'Moseulpo amberjack' raised in that rough water is firm and rich — prized as the finest winter sashimi.\n\nAt its center are amberjack tastings and sales at below-market prices and a direct seafood market. Along with the fun of sampling a big amberjack cut by cut come novelty bare-hand catching, auction demonstrations, village performances and singing contests that turn the whole port into a feast. Sashimi, braised and grilled amberjack — you can enjoy every preparation in one place.\n\nLed by the fish most abundant in that place and season, it lifts both local fishers' income and winter tourism — Seogwipo's signature winter food festival. 💡 Tip: bigger amberjack ('daebangeo') is richer and tastier, so if you're in a group, share one large fish cut by cut." } },
  15: { desc:{ ko:"유네스코 세계자연유산이자 이름부터 '해가 뜨는 봉우리'인 서귀포시 성산읍 성산일출봉에서, 한 해의 끝과 시작을 맞이하는 해맞이 축제다. 약 5천 년 전 바닷속 화산 분출로 솟아오른 성산일출봉은 예로부터 제주 최고의 일출 명소로 꼽혀, '영주십경(제주 10경)'의 으뜸으로 불려 왔다.\n\n행사는 12월 31일 밤부터 1월 1일 아침까지 이어진다. 마지막 밤에는 전통공연과 불꽃, 소원 기원 행사와 카운트다운이 펼쳐지고, 새해 첫날 새벽이면 수만 명이 분화구 능선과 광치기해변에 모여 바다 너머로 떠오르는 첫 태양을 바라보며 저마다의 소망을 빈다. 분화구를 붉게 물들이며 솟는 일출은 제주에서 맞는 새해의 가장 상징적인 장면이다.\n\n거대한 무대나 소비가 아니라 자연이 빚은 화산체와 일출이라는 풍경 그 자체가 주인공인 축제로, 세계자연유산을 아끼며 함께 새해를 여는 자리다. 💡 팁: 일출 시각과 매표·입장 시간을 미리 확인하고, 정상까지는 오르막 계단이 많으니 방한복과 미끄럼 방지 신발은 필수다.",
      en:"At UNESCO-listed Seongsan Ilchulbong — its very name meaning 'sunrise peak' — in Seongsan-eup, Seogwipo, this festival greets the year's end and beginning. Thrust up from the sea by a volcanic eruption some 5,000 years ago, Ilchulbong has long been Jeju's finest sunrise spot, hailed as the foremost of the island's 'Ten Scenic Views.'\n\nEvents run from the night of December 31 into the morning of January 1. The last night brings traditional performances, fireworks, wish-making rites and a countdown; at dawn on New Year's Day tens of thousands gather on the crater ridge and Gwangchigi Beach to watch the first sun rise over the sea and make their wishes. Climbing red over the crater, the sunrise is the most iconic image of a new year in Jeju.\n\nWith the volcanic cone and sunrise nature made — not a giant stage or consumption — as the star, it's a gathering that opens the new year while cherishing a World Natural Heritage site. 💡 Tip: check the sunrise time and ticketing/entry hours in advance, and since many uphill stairs lead to the summit, warm clothes and non-slip shoes are a must." } },
  16: { desc:{ ko:"제주 연안에 사는 멸종위기·해양보호생물 남방큰돌고래를 기리고 함께 지키자는 뜻으로 열리는 생태 축제다. 제주 서부 대정·구좌 앞바다에는 약 120마리의 남방큰돌고래가 정착해 사는데, 이들은 전 세계에서 우리나라 제주 연안에만 무리 지어 사는 귀한 이웃이다. 축제는 해안가 도구리알 공원 등에서 하루 동안 열린다.\n\n돌고래의 생태와 보호를 배우는 전문가 해설과 다큐 상영, 해안을 걸으며 쓰레기를 줍는 플로깅, 동물권과 채식을 생각하는 비건 먹거리 마켓이 함께 열리고, 어린이 백일장과 그림 대회, 팝업 책방·굿즈숍, 밴드 공연으로 남녀노소가 어우러진다. 배를 타고 바짝 쫓는 관광 대신 '멀리서 지켜보되 방해하지 않는' 관찰 문화를 이야기한다.\n\n야생동물을 구경거리로 소비하지 않고 그 서식지와 권리를 지키자고 제안한다는 점에서, 인간과 바다 생명의 공존을 고민하는 가장 제주다운 지속가능 축제다. 💡 팁: 실제 돌고래는 대정 신도리·무릉리 해안도로에서 자주 목격되니, 방문 시 배 투어 대신 해안 산책로에서 조용히 기다려 보자.",
      en:"This eco-festival honors and rallies people to protect the endangered, legally protected Indo-Pacific bottlenose dolphins living off Jeju. About 120 of them settle in the waters off western Jeju (Daejeong and Gujwa) — precious neighbors that, worldwide, live in pods only along Jeju's coast. It runs for a day at coastal spots such as Doguri-al Park.\n\nExpert talks and documentary screenings on dolphin ecology and conservation, coastal plogging, and a vegan food market reflecting on animal rights and plant-based eating come together with children's writing and drawing contests, a pop-up bookshop and goods stalls, and band performances for all ages. Instead of boats chasing close, it champions a 'watch from afar but don't disturb' ethic.\n\nBy urging people to protect wildlife's habitat and rights rather than consume animals as a spectacle, it is the most quintessentially Jeju of sustainable festivals — a place to ponder how humans and sea life can coexist. 💡 Tip: real dolphins are often spotted along the Sindo-ri and Mureung-ri coastal roads in Daejeong, so rather than a boat tour, wait quietly on the shore path." } },
  17: { img:"https://tong.visitkorea.or.kr/cms/resource/91/4039191_image2_1.jpg", homepage:"https://www.sgpcanola.com/",
    desc:{ ko:"서귀포시 표선면 가시리 녹산로 일대에서 봄(보통 4월)에 열리는 제주 대표 봄꽃 축제다. 가시리 녹산로는 도로 양옆으로 유채꽃과 벚꽃이 십 리 넘게 이어져 '한국의 아름다운 길 100선'에 꼽힌 곳으로, 10만㎡에 달하는 드넓은 유채꽃밭이 온통 노랗게 물드는 풍경이 이 축제의 주인공이다.\n\n끝없이 펼쳐진 노란 유채꽃밭과 녹산로 꽃길을 따라 걸으며 제주의 봄바람과 오름 풍경을 즐기고, 차 없는 거리 운영으로 도로 위를 자유롭게 거닐 수 있다. 유채꽃을 활용한 원데이 클래스, 수공예 플리마켓, 버스킹과 무대공연, 가시리 마을에서 준비한 지역 먹거리까지 볼거리·즐길거리가 풍성하다. 배경이 탁 트여 있어 가족 나들이와 인생사진 명소로도 이름 높다.\n\n마을공동체(가시리)가 직접 운영하고 수익이 지역으로 돌아가며, 차 없는 거리로 걷기를 권한다는 점에서 자연과 지역을 함께 살리는 '보고 걷고 즐기는' 지속가능한 봄 여행 코스다. 💡 팁: 유채꽃은 4월 초·중순이 절정이니 개화 시기를 확인하고, 인근 조랑말체험공원·따라비오름과 묶어 하루 코스로 돌아보면 좋다.",
      en:"Held in spring (usually April) along Noksan-ro in Gasiri, Pyoseon, Seogwipo, this is one of Jeju's signature spring-flower festivals. Noksan-ro, lined for miles with canola and cherry blossoms, is named among 'Korea's 100 most beautiful roads,' and the star of the show is the vast 100,000㎡ of rape-flower fields turning everything gold.\n\nStrolling the endless yellow fields and the Noksan-ro flower road, you enjoy Jeju's spring breeze and oreum scenery, free to wander the car-free street. Canola-themed one-day classes, a handcraft flea market, busking and stage shows, and local food prepared by Gasiri village make for a rich day out. With its wide-open backdrop, it's renowned for family outings and once-in-a-lifetime photos.\n\nRun by the Gasiri village community with proceeds returning locally and walking encouraged on a car-free street, it's a 'see, walk and enjoy' sustainable spring course that revives both nature and the community. 💡 Tip: canola peaks in early-to-mid April, so check the bloom, and pair it with the nearby Pony Experience Park and Ttarabi Oreum for a full-day route." } },
  18: { desc:{ ko:"세계 환경의 날(6월 5일)을 전후해 서귀포시 중문 제주국제컨벤션센터(ICC JEJU) 야외광장 등에서 열리는 시민참여형 환경 축제다. 청정 자연을 자산으로 살아가는 제주가 기후위기와 쓰레기 문제에 스스로 답하기 위해 마련한 자리로, 구호가 아니라 '직접 해 보며 배우는' 실천형 프로그램으로 채워진다.\n\n환경 체험·전시와 녹색소비 한마당, 버려진 물건을 새 물건으로 되살리는 업사이클링 만들기, 다회용기 사용과 무포장(제로웨이스트) 장터, 어린이 환경 인형극과 청소년 환경 백일장, 친환경 자전거 라이딩과 전문가 토크콘서트까지 온 가족이 참여할 거리가 가득하다. 태양광·전기차 등 친환경 기술을 직접 보고 체험하는 부스도 함께 운영된다.\n\n도민과 관광객이 함께 '2040 플라스틱 제로 제주', '2035 탄소중립'을 향한 걸음을 나누는 환경교육과 실천의 장으로, 이 앱이 지향하는 지속가능한 축제 문화의 상징과도 같은 행사다. 💡 팁: 다회용 컵·장바구니를 챙겨 가면 무포장 장터에서 더 편하게 참여할 수 있고, 일부 체험은 사전접수로 마감되니 프로그램을 미리 확인하자.",
      en:"Around World Environment Day (June 5), this citizen-participation festival takes over venues like the outdoor plaza of ICC Jeju in Jungmun, Seogwipo. Jeju, which lives off its clean nature as an asset, created it to answer the climate crisis and waste problem itself — filling it not with slogans but with hands-on, learn-by-doing programs.\n\nEco exhibits and experiences, a green-consumption fair, upcycling workshops that remake discarded goods, a zero-waste market using reusable containers, a children's environmental puppet show, a youth eco-writing contest, eco bike rides and expert talk concerts give the whole family plenty to join. Booths let you see and try green technology like solar power and EVs.\n\nAs a place of environmental education and action where residents and visitors step together toward a '2040 Plastic-Free Jeju' and '2035 carbon neutrality,' it is a symbol of the very sustainable-festival culture this app champions. 💡 Tip: bring a reusable cup and shopping bag to take part more easily at the zero-waste market, and check the program ahead since some activities close by pre-registration." } },
};

function festivalPublic(f) {
  const ex = CURATED_EXTRA[f.id] || {};
  const revs = reviewsForFestival(f.id);
  const rAvg = revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : f.rate;
  const sAvg = revs.length ? revs.reduce((s, r) => s + r.sustainability, 0) / revs.length : 4.0;
  return { ...f, ...ex, method: f.method || METHODS[f.id] || "geo", qr: qrFor(f.id),
    ratingAvg: +rAvg.toFixed(1), susAvg: +sAvg.toFixed(1), reviewCount: revs.length };
}

/* ---------------- TourAPI (한국관광공사) live festivals ----------------
 * Set a free data.go.kr key:  TOURAPI_KEY=xxxx node server.js
 * Without a key the app runs on the curated list only (LIVE stays empty). */
function readKeyFile(){
  try { return fs.readFileSync(path.join(ROOT, "data", "tourapi_key.txt"), "utf8").trim(); }
  catch (e) { return ""; }
}
// key from env var, or from data/tourapi_key.txt (data/ is gitignored → never committed)
const TOURAPI_KEY = process.env.TOURAPI_KEY || readKeyFile();

/* ---------------- Google Sign-In (verify ID token, zero-dep) ----------------
 * Set your OAuth client id:  GOOGLE_CLIENT_ID=xxx node server.js
 * or put it in data/google_client_id.txt (gitignored). */
function readClientIdFile(){ try { return fs.readFileSync(path.join(ROOT, "data", "google_client_id.txt"), "utf8").trim(); } catch (e) { return ""; } }
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || readClientIdFile();
let googleKeys = null, googleKeysExp = 0;
async function getGoogleKeys(){
  if (googleKeys && Date.now() < googleKeysExp) return googleKeys;
  const res = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  googleKeys = await res.json();
  googleKeysExp = Date.now() + 60 * 60 * 1000;   // cache 1h
  return googleKeys;
}
async function verifyGoogleToken(idToken){
  const p = (idToken || "").split(".");
  if (p.length !== 3) throw new Error("malformed");
  const header = JSON.parse(Buffer.from(p[0], "base64url").toString());
  const payload = JSON.parse(Buffer.from(p[1], "base64url").toString());
  const { keys } = await getGoogleKeys();
  const jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) throw new Error("key_not_found");
  const pub = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const ok = crypto.verify("RSA-SHA256", Buffer.from(p[0] + "." + p[1]), pub, Buffer.from(p[2], "base64url"));
  if (!ok) throw new Error("bad_signature");
  const iss = (payload.iss || "").replace(/^https?:\/\//, "");
  if (iss !== "accounts.google.com") throw new Error("bad_iss");
  if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) throw new Error("bad_aud");
  if (!payload.exp || payload.exp * 1000 < Date.now()) throw new Error("expired");
  if (payload.email && payload.email_verified === false) throw new Error("email_unverified");
  return payload;
}
const TOURAPI_ENDPOINTS = [
  { svc: "KorService2", op: "searchFestival2" },
  { svc: "KorService1", op: "searchFestival1" }
];
let LIVE = [], liveFetchedAt = 0;
const VERIFY = {
  geo:    { ko: "위치 기반 체크인", en: "Location check-in" },
  qr:     { ko: "QR 코드 스캔",   en: "QR code scan" },
  ticket: { ko: "티켓 사진 업로드", en: "Ticket photo upload" }
};
const CATSTAMP = { eco: "🌿", tradition: "🎎", agri: "🧺", leisure: "⛺" };
function apiDate(s){ return (s && s.length === 8) ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}` : ""; }
function guessCat(t){
  if (/환경|생태|반딧불|곶자왈|돌고래|플로깅|습지|숲|청정/.test(t)) return "eco";
  if (/문화|역사|전통|탐라|민속|불축제|굿|예술/.test(t)) return "tradition";
  if (/꽃|유채|보리|귤|감귤|녹차|농|수확|바당|자리돔|방어|조개|해녀|수산|어촌|테우|미역/.test(t)) return "agri";
  return "leisure";
}
function guessGreen(t){ return /환경|생태|에코|플로깅|업사이클|탄소|정화|보전|반딧불|곶자왈|돌고래|청정|녹색/.test(t); }
function mapLive(item, i){
  const txt = (item.title || "") + " " + (item.addr1 || "");
  const cat = guessCat(txt), method = ["geo","qr","ticket"][i % 3];
  return {
    id: Number(item.contentid), cat, green: guessGreen(txt),
    lat: Number(item.mapy) || 33.38, lng: Number(item.mapx) || 126.55,
    rate: 4.2, stamp: CATSTAMP[cat],
    name: { ko: item.title || "", en: item.title || "" },
    loc:  { ko: item.addr1 || "제주", en: item.addr1 || "Jeju" },
    start: apiDate(item.eventstartdate), end: apiDate(item.eventenddate) || apiDate(item.eventstartdate),
    verify: VERIFY[method],
    desc: { ko: "한국관광공사 TourAPI에서 실시간으로 불러온 축제입니다.",
            en: "Live festival data from the Korea Tourism Organization (TourAPI)." },
    sus: { ko: [], en: [] },
    img: (item.firstimage || item.firstimage2 || "").replace(/^http:\/\//, "https://"),
    method, live: true
  };
}
function normTitle(s){ return (s||"").replace(/\s|제\d+회|축제|페스티벌|festival/gi, ""); }
async function refreshLive(){
  if (!TOURAPI_KEY) return;
  // trailing 24-month window so we always catch the festivals the API actually has registered
  const d = new Date(); d.setMonth(d.getMonth() - 24);
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const curated = new Set(FESTIVALS.map(f => normTitle(f.name.ko)));
  for (const ep of TOURAPI_ENDPOINTS) {
    try {
      const url = `https://apis.data.go.kr/B551011/${ep.svc}/${ep.op}?serviceKey=${encodeURIComponent(TOURAPI_KEY)}` +
        `&MobileOS=ETC&MobileApp=JejuFesta&_type=json&arrange=A&areaCode=39&numOfRows=200&pageNo=1&eventStartDate=${ymd}`;
      const res = await fetch(url);
      const data = await res.json();
      const items = data && data.response && data.response.body && data.response.body.items && data.response.body.items.item;
      if (Array.isArray(items) && items.length) {
        LIVE = items
          .filter(x => x.contentid && x.mapx && x.mapy && x.title)
          .map(mapLive)
          .filter(f => !curated.has(normTitle(f.name.ko)))    // drop duplicates of curated ones
          .filter(f => f.end >= "2026-01-01");                // take out past (2025 and earlier) festivals
        liveFetchedAt = Date.now();
        console.log(`TourAPI(${ep.op}): loaded ${LIVE.length} live 제주 festivals`);
        return;
      }
    } catch (e) { /* try next endpoint */ }
  }
  console.log("TourAPI: no festivals returned (check key / endpoint)");
}
function allFestivals(){ return LIVE.length ? FESTIVALS.concat(LIVE) : FESTIVALS; }

/* on-demand detail enrichment for live festivals (real overview + event info) */
function stripHtml(s){
  return (s || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&")
    .replace(/&#39;/g, "'").replace(/&quot;/gi, '"')
    .replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();
}
async function tourFetch(op, extra){
  const url = `https://apis.data.go.kr/B551011/KorService2/${op}?serviceKey=${encodeURIComponent(TOURAPI_KEY)}` +
    `&MobileOS=ETC&MobileApp=JejuFesta&_type=json${extra}`;
  const res = await fetch(url); return res.json();
}
function firstItem(data){
  const it = data && data.response && data.response.body && data.response.body.items && data.response.body.items.item;
  return Array.isArray(it) ? it[0] : it;
}
async function enrichLive(f){
  if (!f || !f.live || f._enriched) return;
  f._enriched = true;                                   // avoid duplicate fetches
  try {
    const common = firstItem(await tourFetch("detailCommon2", `&contentId=${f.id}`));
    if (common) {
      const ov = stripHtml(common.overview);
      if (ov) f.desc = { ko: ov, en: ov };
      const hp = (common.homepage || "").match(/https?:\/\/[^\s"'<>]+/);
      if (hp) f.homepage = hp[0];
    }
    const intro = firstItem(await tourFetch("detailIntro2", `&contentId=${f.id}&contentTypeId=15`));
    if (intro) {
      const info = {}, add = (k, v) => { v = stripHtml(v); if (v) info[k] = v; };
      add("장소", intro.eventplace);
      add("주최", intro.sponsor1);
      add("문의", intro.sponsor1tel || intro.sponsortel1);
      add("관람시간", intro.playtime);
      add("이용요금", intro.usetimefestival);
      add("프로그램", intro.program);
      if (Object.keys(info).length) f.info = info;
    }
  } catch (e) { /* keep the generic description on failure */ }
}
function userStamps(userId) {
  return DB.checkins.filter(c => c.userId === userId).map(c => c.festivalId);
}
function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, avatar: u.avatar, stamps: userStamps(u.id) };
}

/* ---------------- http ---------------- */
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css",
  ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon" };

function send(res, code, data, headers = {}) {
  const body = typeof data === "string" ? data : JSON.stringify(data);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = ""; req.on("data", c => b += c);
    req.on("end", () => { try { resolve(b ? JSON.parse(b) : {}); } catch (e) { resolve({}); } });
  });
}
function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel === "/") rel = "/index.html";
  const fp = path.join(PUB, path.normalize(rel));
  if (!fp.startsWith(PUB)) return send(res, 403, { error: "forbidden" });
  fs.readFile(fp, (err, data) => {
    if (err) return send(res, 404, "Not found", { "Content-Type": "text/plain" });
    res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (!url.startsWith("/api/")) return serveStatic(req, res);

  const body = (req.method === "POST" || req.method === "PUT") ? await readBody(req) : {};

  /* ---- auth ---- */
  if (url === "/api/signup" && req.method === "POST") {
    const email = (body.email || "").trim().toLowerCase();
    const pw = body.password || "";
    const name = (body.name || "").trim() || "제주여행자";
    const avatar = body.avatar || "🧑‍🌾";
    if (!email || !pw) return send(res, 400, { error: "email_password_required" });
    if (pw.length < 4) return send(res, 400, { error: "password_too_short" });
    if (Object.values(DB.users).some(u => u.email === email))
      return send(res, 409, { error: "email_taken" });
    const salt = crypto.randomBytes(16).toString("hex");
    const id = newId();
    DB.users[id] = { id, email, salt, passHash: hashPw(pw, salt), name, avatar, createdAt: Date.now() };
    const token = crypto.randomBytes(24).toString("hex");
    DB.sessions[token] = { userId: id, createdAt: Date.now() };
    saveDB();
    return send(res, 200, { token, user: publicUser(DB.users[id]) });
  }

  if (url === "/api/login" && req.method === "POST") {
    const email = (body.email || "").trim().toLowerCase();
    const pw = body.password || "";
    const u = Object.values(DB.users).find(x => x.email === email);
    if (!u || u.passHash !== hashPw(pw, u.salt))
      return send(res, 401, { error: "invalid_credentials" });
    const token = crypto.randomBytes(24).toString("hex");
    DB.sessions[token] = { userId: u.id, createdAt: Date.now() };
    saveDB();
    return send(res, 200, { token, user: publicUser(u) });
  }

  if (url === "/api/logout" && req.method === "POST") {
    const auth = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
    delete DB.sessions[auth]; saveDB();
    return send(res, 200, { ok: true });
  }

  if (url === "/api/me" && req.method === "GET") {
    const u = sessionUser(req);
    if (!u) return send(res, 401, { error: "unauthorized" });
    return send(res, 200, { user: publicUser(u) });
  }

  /* ---- bug report ---- */
  if (url === "/api/report" && req.method === "POST") {
    const message = (body.message || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    if (message.length < 3) return send(res, 400, { error: "empty_report" });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { error: "invalid_email" });
    if (!Array.isArray(DB.reports)) DB.reports = [];
    DB.reports.push({ message: message.slice(0, 2000), email, ts: Date.now(), ua: (req.headers["user-agent"] || "").slice(0, 200) });
    saveDB();
    notifyReport(message, email); // best-effort, don't block the response
    return send(res, 200, { ok: true });
  }

  if (url === "/api/config" && req.method === "GET") {
    return send(res, 200, { googleClientId: GOOGLE_CLIENT_ID || "" });
  }

  if (url === "/api/google" && req.method === "POST") {
    if (!GOOGLE_CLIENT_ID) return send(res, 400, { error: "google_not_configured" });
    try {
      const payload = await verifyGoogleToken(body.credential);
      const email = (payload.email || "").trim().toLowerCase();
      if (!email) return send(res, 401, { error: "google_failed" });
      let u = Object.values(DB.users).find(x => x.email === email);
      if (!u) {
        const id = newId();
        u = { id, email, name: payload.name || payload.given_name || "Google 사용자",
              avatar: "🙂", google: true, sub: payload.sub, createdAt: Date.now() };
        DB.users[id] = u;
      }
      const token = crypto.randomBytes(24).toString("hex");
      DB.sessions[token] = { userId: u.id, createdAt: Date.now() };
      saveDB();
      return send(res, 200, { token, user: publicUser(u) });
    } catch (e) {
      return send(res, 401, { error: "google_failed" });
    }
  }

  /* ---- festivals ---- */
  if (url === "/api/festivals" && req.method === "GET") {
    return send(res, 200, { festivals: allFestivals().map(festivalPublic), live: LIVE.length, liveFetchedAt });
  }

  const fMatch = url.match(/^\/api\/festivals\/(\d+)$/);
  if (fMatch && req.method === "GET") {
    const f = allFestivals().find(x => x.id === +fMatch[1]);
    if (!f) return send(res, 404, { error: "not_found" });
    if (f.live) await enrichLive(f);
    return send(res, 200, { festival: festivalPublic(f), reviews: reviewsForFestival(f.id) });
  }

  const ciMatch = url.match(/^\/api\/festivals\/(\d+)\/checkin$/);
  if (ciMatch && req.method === "POST") {
    const u = sessionUser(req);
    if (!u) return send(res, 401, { error: "unauthorized" });
    const fid = +ciMatch[1];
    const f = allFestivals().find(x => x.id === fid);
    if (!f) return send(res, 404, { error: "not_found" });
    const method = f.method || METHODS[fid] || "geo";

    // already collected → idempotent success
    if (DB.checkins.some(c => c.userId === u.id && c.festivalId === fid))
      return send(res, 200, { stamps: userStamps(u.id) });

    // validate proof by method
    let proof = { method };
    if (method === "qr") {
      if ((body.code || "").trim().toUpperCase() !== qrFor(fid))
        return send(res, 422, { error: "checkin_failed", reason: "bad_qr" });
    } else if (method === "ticket") {
      if (!body.hasPhoto)
        return send(res, 422, { error: "checkin_failed", reason: "no_photo" });
      proof.photo = true;
    } else if (method === "geo") {
      if (body.demo) {
        proof.demo = true;
      } else {
        if (typeof body.lat !== "number" || typeof body.lng !== "number")
          return send(res, 422, { error: "checkin_failed", reason: "no_location" });
        const dist = haversineKm(body.lat, body.lng, f.lat, f.lng);
        proof.distanceKm = +dist.toFixed(2);
        if (dist > GEOFENCE_KM)
          return send(res, 422, { error: "checkin_failed", reason: "too_far", distanceKm: +dist.toFixed(1) });
      }
    }

    DB.checkins.push({ userId: u.id, festivalId: fid, at: Date.now(), ...proof });
    saveDB();
    return send(res, 200, { stamps: userStamps(u.id), method });
  }

  const rvMatch = url.match(/^\/api\/festivals\/(\d+)\/review$/);
  if (rvMatch && req.method === "POST") {
    const u = sessionUser(req);
    if (!u) return send(res, 401, { error: "unauthorized" });
    const fid = +rvMatch[1];
    if (!allFestivals().some(f => f.id === fid)) return send(res, 404, { error: "not_found" });
    const rating = Math.max(1, Math.min(5, +body.rating || 5));
    const sustainability = Math.max(1, Math.min(5, +body.sustainability || 5));
    const text = (body.text || "").toString().slice(0, 400);
    const rev = { id: newId(), festivalId: fid, userId: u.id, name: u.name, avatar: u.avatar,
      rating, sustainability, text: { ko: text, en: text }, at: Date.now() };
    DB.reviews.unshift(rev);
    saveDB();
    return send(res, 200, { review: rev, festival: festivalPublic(allFestivals().find(f => f.id === fid)) });
  }

  /* ---- leaderboard (monthly season; resets on the 1st) ---- */
  if (url === "/api/leaderboard" && req.method === "GET") {
    const FILL_TO = 8; // if fewer than this many real users have checked in this month, top up with bots
    const now = new Date();
    const y = now.getFullYear(), mo = now.getMonth();
    // count only this-month check-ins per real user
    const counts = {};
    DB.checkins.forEach(c => {
      const d = new Date(c.at || 0);
      if (d.getFullYear() === y && d.getMonth() === mo) counts[c.userId] = (counts[c.userId] || 0) + 1;
    });
    const real = Object.entries(counts).map(([uid, count]) => {
      const u = DB.users[uid]; if (!u) return null;
      return { name: u.name, avatar: u.avatar, count, userId: uid };
    }).filter(Boolean);

    let board = real.slice();
    if (real.length < FILL_TO) {
      // deterministic per-month variation so filler feels alive but stays stable within the month
      const seed = y * 100 + (mo + 1);
      const rnd = mulberry32(seed);
      const bots = SEED_BOTS
        .map(b => ({ name: b.name, avatar: b.avatar, bot: true, count: Math.max(1, b.count + (Math.floor(rnd() * 3) - 1)) }))
        .sort(() => rnd() - 0.5)
        .slice(0, FILL_TO - real.length);
      board = board.concat(bots);
    }
    board.sort((a, b) => b.count - a.count);
    const season = `${y}.${String(mo + 1).padStart(2, "0")}`;
    return send(res, 200, { leaderboard: board, season, realCount: real.length });
  }

  /* ---- page-view counter (called once per site load) ---- */
  if (url === "/api/view" && req.method === "POST") {
    DB.views = (DB.views || 0) + 1;
    saveDB();
    return send(res, 200, { ok: true });
  }

  /* ---- collective sustainability impact ---- */
  if (url === "/api/impact" && req.method === "GET") {
    const greenIds = new Set(allFestivals().filter(f => f.green).map(f => f.id));
    const realStamps = DB.checkins.length;
    const realTravelers = new Set(DB.checkins.map(c => c.userId)).size;
    const realGreen = DB.checkins.filter(c => greenIds.has(c.festivalId)).length;
    const realReviews = DB.reviews.length;
    const realSignups = Object.keys(DB.users).length;
    const realViews = DB.views || 0;
    // gentle community baseline that grows daily so the counter feels alive; real activity adds on top
    const launch = Date.UTC(2026, 6, 1); // 2026-07-01
    const days = Math.max(0, Math.floor((Date.now() - launch) / 86400000));
    const stamps = 480 + days * 4 + realStamps;
    const travelers = 60 + Math.floor(days / 2) + realTravelers;
    const green = 300 + days * 3 + realGreen;
    const reviews = 210 + days * 2 + realReviews;
    const signups = 130 + days + realSignups;          // registered accounts
    const views = 3400 + days * 60 + realViews;         // website page loads
    // illustrative estimate: ~2.3 kg CO2 avoided per sustainable visit (car-free travel + reusables)
    const co2 = Math.round(green * 2.3);
    return send(res, 200, { stamps, travelers, green, reviews, co2, signups, views });
  }

  return send(res, 404, { error: "unknown_route" });
});

async function start() {
  DB = await loadDB();                            // load persisted data before serving
  server.listen(PORT, () => {
    console.log(`Jeju Festa server → http://localhost:${PORT}`);
    console.log(USE_REDIS ? "Storage: Upstash Redis (persistent ✓)" : "Storage: local file data/db.json (resets on redeploy)");
    console.log(TOURAPI_KEY ? "TourAPI key detected — fetching live 제주 festivals…"
                            : "TourAPI key not set — curated festival list only.");
  });
  refreshLive();                                  // initial live fetch
  setInterval(refreshLive, 6 * 60 * 60 * 1000);   // refresh every 6h
}
start();
