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
const emptyDB = () => ({ users: {}, sessions: {}, checkins: [], reviews: [] });

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
    desc:{ ko:"제주 최대 규모의 전통문화 축제로, '1만 8천 신들의 고향'이라 불리는 제주의 신화·민속·예술을 한자리에서 만난다. 탐라개벽 신화를 무대로 옮긴 개막 퍼레이드와 큰굿 시연, 제주도민속예술축제(민속예술 경연), 해녀·심방 문화 공연이 이어지고, 칠머리당 영등굿 등 유네스코 무형유산과 맞닿은 프로그램도 만날 수 있다. 원도심 일대에서 전통 놀이·먹거리·공예 체험이 함께 열려 제주의 정체성과 공동체 문화를 오롯이 느낄 수 있는 자리다.",
      en:"Jeju's largest traditional-culture festival gathers the myths, folk arts and rituals of an island long called 'the home of 18,000 gods.' It opens with a myth-based parade and a Jeju 'keun-gut' shaman rite, followed by the island's folk-arts competition, haenyeo performances, and programs tied to UNESCO intangible heritage such as the Chilmeoridang Yeongdeung-gut. Across the old town you'll find traditional games, food and craft experiences that lay bare Jeju's identity and community spirit." } },
  2: { img:"https://tong.visitkorea.or.kr/cms/resource/15/4061015_image2_1.jpg", homepage:"https://firefestivaljeju.com/",
    desc:{ ko:"제주의 목축 문화에서 유래한 '오름 들불 놓기'를 현대적으로 되살린 제주 대표 축제로, 새별오름 전체에 불을 놓아 밤하늘을 물들이는 오름 불놓기가 압권이다. 사전행사로 소원지 쓰기·상징 달집 만들기·오름 도슨트가 운영되고, 본행사에서는 주제공연과 문화공연, 다양한 체험, 그리고 다회용기·쓰레기 저감 같은 친환경 프로그램이 함께 진행된다. 최근에는 산불 예방과 탄소 저감을 고려해 운영 방식을 친환경으로 전환하며 '지속가능한 축제'로 거듭나고 있다.",
      en:"Jeju's signature festival revives the old herding practice of burning the oreum: the climax is the moment all of Saebyeol Oreum is set alight, glowing across the night sky. Pre-events include wish-note writing, building the symbolic 'daljip' bonfire tower and oreum docent walks, while the main days bring theme and culture performances, hands-on activities, and eco programs like reusable-container use and waste reduction. It has recently shifted to a greener format to prevent wildfires and cut carbon — reinventing itself as a truly sustainable festival." } },
  3: { img:"https://tong.visitkorea.or.kr/cms/resource/68/3543168_image2_1.jpg",
    desc:{ ko:"위에서 보면 가오리를 닮은 탄소중립 섬 가파도에서, 봄바람에 일렁이는 청보리밭을 배경으로 열리는 섬마을 축제다. 오르막이 거의 없어 1~2시간이면 걸어서 한 바퀴 도는 섬을 따라 청보리밭 산책과 올레 10-1코스 걷기, 보물찾기, 주민들이 준비한 야외공연과 로컬푸드를 즐길 수 있다. 차 없는 도보 여행과 재생에너지 운영으로 '느리게, 깨끗하게' 즐기는 지속가능 여행지로 꼽힌다.",
      en:"On Gapado — a carbon-neutral island shaped like a stingray from above — this village festival unfolds across fields of green barley rippling in the spring wind. The island is almost flat and walkable in an hour or two, so visitors stroll the barley fields and Olle Route 10-1, join a treasure hunt, and enjoy resident-run performances and local food. Car-free travel and renewable energy make it a model of slow, clean, sustainable tourism." } },
  4: { desc:{ ko:"감귤의 고장 서귀포 남원읍 의귀리에서, 온 마을이 하얀 귤꽃 향기로 뒤덮이는 5월에 열리는 마을 축제다. 끝없이 이어진 귤꽃길을 걸으며 은은한 꽃향기를 맡고, 감귤밭 체험과 귤꽃 차 만들기, 농산물 직거래 장터, 마을 주민이 준비한 문화공연을 즐길 수 있다. 대규모 관광 축제와 달리 마을공동체가 손수 꾸리는 소박하고 정겨운 봄 축제로, 제주 농촌의 일상과 계절을 가까이에서 느낄 수 있다.",
      en:"In Uigwi-ri, a tangerine-farming village in Namwon, Seogwipo, this May festival fills the whole village with the scent of white citrus blossoms. Visitors walk endless blossom-lined paths, try tangerine-grove experiences and blossom-tea making, browse a direct-from-farm market, and enjoy resident-run performances. Unlike big tourist events it's a modest, warm, community-made spring festival that brings you close to everyday rural Jeju." } },
  5: { img:"https://tong.visitkorea.or.kr/cms/resource/92/3550692_image2_1.jpg",
    desc:{ ko:"자리물회로 이름난 서귀포 보목포구에서, 자리돔이 제철을 맞는 5월에 열리는 어촌 로컬푸드 축제다. 갓 잡은 자리돔으로 만든 자리물회·자리구이 시식과 맨손으로 자리 잡기 체험이 대표 프로그램이며, 어촌계와 해녀가 이어온 바다살이 문화도 만날 수 있다. 한라산을 병풍처럼 두르고 문섬·섶섬이 떠 있는 포구에서 즐기는 제철 밥상은 제주 바다의 계절을 그대로 담아낸다.",
      en:"At Bomok Port in Seogwipo — famous for 'jari-mulhoe' cold fish soup — this fishing-village food festival lands in May when damselfish are in season. Highlights are tastings of just-caught jari as cold soup and grilled fish, plus bare-hand fish-catching, alongside the sea-living culture kept alive by the fishers' cooperative and haenyeo. Set in a harbor framed by Hallasan with Munseom and Seopseom offshore, its seasonal table captures the very taste of Jeju's sea." } },
  6: { desc:{ ko:"제주시 한경면 청수리의 원시림 곶자왈에서, 초여름 밤에만 만날 수 있는 반딧불이를 주인공으로 하는 생태 축제다. 해가 지면 인공조명을 최소화한 어둠 속에서 반짝이는 반딧불이 군무를 탐사하고, 곶자왈의 생태와 습지·용암지형에 대한 해설 프로그램에 참여할 수 있다. 빛 공해를 줄이고 서식지를 보호하는 방식으로 운영되어, 반딧불이가 살 수 있는 청정 자연의 소중함을 몸으로 배우는 환경교육의 장이 된다.",
      en:"In the primeval Gotjawal forest of Cheongsu-ri, Hangyeong, this eco-festival stars fireflies that appear only on early-summer nights. After dark, in deliberately minimal lighting, visitors trek to watch their shimmering dance and join guided talks on Gotjawal's ecology, wetlands and lava terrain. Run to cut light pollution and protect the habitat, it doubles as hands-on environmental education about the clean nature fireflies need to survive." } },
  7: { img:"https://tong.visitkorea.or.kr/cms/resource/20/3039520_image2_1.jpeg",
    desc:{ ko:"규산염 광물이 섞여 햇빛에 반짝이는 검은 모래로 유명한 제주시 삼양해수욕장에서 열리는 여름 축제다. 뜨겁게 달궈진 검은 모래에 몸을 파묻는 '모래찜질'이 대표 프로그램으로, 예로부터 신경통과 관절염에 좋다고 전해져 여름이면 찜질을 즐기는 사람들로 붐빈다. 검은 모래와 에메랄드빛 바다를 배경으로 한 해변 프로그램과 지역 공연, 가족 물놀이가 어우러져 소박하지만 특별한 여름 바다를 선사한다.",
      en:"Held at Samyang Beach, famed for black sand that glitters with silicate minerals in the sun, this is a summer seaside festival. Its signature is 'sand bathing' — burying yourself in the sun-heated black sand, long believed to ease neuralgia and arthritis, drawing crowds each summer. Beach programs, local performances and family water play against the black sand and emerald sea make for a humble but memorable summer by the water." } },
  8: { desc:{ ko:"제주시 외도동을 흐르는 월대천에서 열리는 ESG·환경 중심의 하천 축제로, 도심 속 자연을 지키는 시민참여형 프로그램이 특징이다. 하천과 해안을 함께 걸으며 쓰레기를 줍는 플로깅, 물과 생태를 배우는 환경체험 부스, 주민이 함께 만드는 공연이 어우러진다. 오래된 팽나무와 맑은 물이 흐르는 월대천의 풍경 속에서, 즐기며 동시에 자연을 돌보는 '지속가능한 놀이'를 경험할 수 있다.",
      en:"On the Woldaecheon stream in Oedo, Jeju City, this ESG-minded stream festival centers on citizen participation to protect nature in the city. It blends plogging along the stream and coast, hands-on booths about water and ecology, and resident-made performances. Amid old hackberry trees and clear flowing water, it offers 'sustainable play' — having fun while caring for nature at the same time." } },
  9: { img:"https://tong.visitkorea.or.kr/cms/resource/66/3354566_image2_1.jpg",
    desc:{ ko:"제주 시내에서 가장 가까운 이호테우해변에서, 붉고 흰 조랑말 등대를 배경으로 열리는 전통어업문화 축제다. 밀물과 썰물의 차이를 이용해 고기를 잡던 제주 전통 어법 '원담'을 복원한 공간에서, 통나무를 엮어 만든 뗏목배 '테우' 시연과 전통 고기잡이 체험이 펼쳐진다. 완만한 백사장과 소나무 숲을 무대로 한 해양체험과 공연이 더해져, 사라져가는 제주 바닷사람들의 삶과 지혜를 오늘에 되살린다.",
      en:"At Iho Tewoo Beach — the closest beach to downtown Jeju, marked by red-and-white pony lighthouses — this festival revives traditional fishing culture. On a restored 'wondam' (stone tidal weir that trapped fish between tides), visitors watch demonstrations of the log raft 'teu' and try traditional fishing. With marine experiences and performances on the gentle white sand and pine grove, it brings the fading life and wisdom of Jeju's sea people back to the present." } },
  10: { img:"https://tong.visitkorea.or.kr/cms/resource/01/3034601_image2_1.jpg",
    desc:{ ko:"도내에서 가장 넓은 백사장(폭 약 313m)을 자랑하는 서귀포 표선해수욕장에서 열리는 여름 가족 축제다. 썰물 때는 둥근 백사장, 밀물 때는 수심 얕은 에메랄드빛 원형 호수로 변하는 독특한 지형 위에서 해변 놀이와 문화공연, 아이와 함께 즐기는 가족 프로그램이 이어진다. 곱고 완만한 모래밭 덕분에 물놀이가 안전해, 온 가족이 느긋하게 제주의 여름 바다를 만끽할 수 있는 곳이다.",
      en:"At Pyoseon Beach in Seogwipo — home to the island's widest sand flat (about 313 m across) — this is a summer family festival. On terrain that turns into a round sandy plain at low tide and a shallow emerald lagoon at high tide, it offers beach play, culture performances and family programs. The fine, gently sloping sand makes the water safe, so whole families can soak up Jeju's summer sea at an easy pace." } },
  11: { desc:{ ko:"유네스코 세계자연유산 성산일출봉을 곁에 둔 성산 앞바다에서 열리는 해양문화 축제로, '바당'은 바다를 뜻하는 제주말이다. 물때에 맞춰 갯벌과 얕은 바다에서 조개를 캐는 조개잡이 체험이 대표 프로그램이며, 해녀 문화와 어촌 살이를 가까이에서 만나고 지역 수산물과 특산물도 맛볼 수 있다. 성산의 극적인 해안 풍경 속에서 바다가 내어주는 먹거리와 이야기를 함께 나누는, 어촌 지역경제를 살리는 축제다.",
      en:"In the waters off Seongsan — beside UNESCO-listed Ilchulbong — this marine-culture festival takes its name from 'badang,' Jeju dialect for the sea. Its signature is clam digging on the flats and shallows at the right tide, alongside close encounters with haenyeo culture and fishing-village life, plus local seafood. Amid Seongsan's dramatic coast, it shares the food and stories the sea provides while supporting the local fishing economy." } },
  12: { img:"https://tong.visitkorea.or.kr/cms/resource/22/3529822_image2_1.jpg",
    desc:{ ko:"제주 원도심을 가로지르는 산지천 일대를 무대로 늦여름에서 초가을에 열리는 도시재생·문화 축제다. 옛 제주읍성 사람들의 젖줄이던 물길을 따라 플리마켓과 전시, 버스킹과 공연이 채워지고, 원도심 골목을 걷는 투어로 오래된 동네의 이야기를 새롭게 만난다. 쇠락했던 원도심에 색과 활기를 더해 지역 상권과 예술가를 잇는, 도시가 다시 살아나는 축제다.",
      en:"Set along the Sanjicheon stream through Jeju's old town, this urban-regeneration culture festival runs from late summer into early autumn. Following the waterway that once nourished the old fortress town, it fills the banks with flea markets, exhibitions, busking and performances, while alley tours reveal the neighborhood's stories anew. By adding color and life to a faded downtown, it reconnects local businesses and artists — a festival of a city coming back to life." } },
  13: { desc:{ ko:"제주 원도심 곳곳에서 연중 비정기적으로 열리는 지역경제·도시재생형 문화행사로, '탐나는전'은 탐라(제주)의 매력과 지역 상점을 잇는다는 뜻을 담고 있다. 골목과 빈 점포를 무대로 플리마켓과 버스킹, 지역 상권 활성화 프로그램이 펼쳐지며, 소상공인과 청년 창작자가 함께 만드는 거리 문화를 즐길 수 있다. 크고 화려한 무대 대신, 걷다가 우연히 마주치는 작은 공연과 가게들이 원도심에 활기를 불어넣는다.",
      en:"Held on and off through the year across Jeju's old town, this regeneration-focused culture event ('Tamnaneunjeon') links the charm of Tamna (Jeju) with local shops. Alleys and empty storefronts become stages for flea markets, busking and small-business programs, showcasing street culture co-created by shopkeepers and young makers. Instead of big flashy stages, it's the small performances and shops you stumble on while walking that breathe life back into downtown." } },
  14: { desc:{ ko:"우리나라 최남단 서귀포 대정읍 모슬포항에서, 제철 방어가 살이 오르는 11월에 열리는 대표 수산업 축제다. 마라도와 가파도 인근 청정 해역에서 잡아 올린 방어를 저렴하게 맛보는 방어 시식과 수산물 직거래가 중심이며, 방어 맨손잡기 같은 이색 체험과 어촌문화 프로그램이 함께 열린다. 겨울 바다의 진미인 대방어를 앞세워 지역 어민과 방문객이 어우러지는, 서귀포의 겨울을 대표하는 미식 축제다.",
      en:"At Moseulpo Port in Daejeong — Korea's southernmost point — this flagship fisheries festival lands in November when amberjack are at their fattest. Centered on affordable amberjack tastings and a direct seafood market with fish from the clean waters near Marado and Gapado, it adds novelty events like bare-hand amberjack catching and fishing-village programs. Led by the prized winter 'daebangeo,' it brings local fishers and visitors together to define Seogwipo's winter." } },
  15: { desc:{ ko:"유네스코 세계자연유산 성산일출봉에서 한 해의 끝과 시작을 맞이하는 해맞이 축제로, 예로부터 제주 최고의 일출 명소로 꼽혀온 이곳에서 새해 첫 태양을 맞는다. 12월 마지막 밤부터 새해 첫날까지 전통공연과 소원 기원 행사가 펼쳐지며, 수만 명이 함께 떠오르는 해를 바라보며 소망을 빈다. 바다에서 솟아오른 화산체 위로 붉게 번지는 일출은, 제주에서 맞는 새해의 가장 상징적인 장면이다.",
      en:"At UNESCO-listed Seongsan Ilchulbong, this sunrise festival greets the year's end and beginning at a spot long considered Jeju's finest place to watch the sun rise. From the last night of December into New Year's Day it offers traditional performances and wish-making rites as tens of thousands watch the sun climb and make their wishes. Spreading red over a volcanic cone born from the sea, the sunrise is the most iconic image of a new year in Jeju." } },
  16: { desc:{ ko:"제주 연안에 사는 멸종위기 남방큰돌고래를 기리고 함께 지키자는 뜻으로 열리는 생태 축제로, 도구리알 공원에서 하루 동안 펼쳐진다. 돌고래의 생태와 보호를 배우는 해설 프로그램, 해안을 걸으며 쓰레기를 줍는 플로깅, 동물권을 생각하는 비건 먹거리 마켓이 함께 열리고, 백일장과 팝업 책방·굿즈숍, 문화공연으로 남녀노소가 어우러진다. '지켜보되 방해하지 않는' 관찰 문화를 이야기하며, 인간과 바다 생명이 공존하는 법을 나누는 자리다.",
      en:"This eco-festival honors and rallies people to protect the endangered Indo-Pacific dolphins living off Jeju, running for a day at Doguri-al Park. It combines talks on dolphin ecology and conservation, coastal plogging, and a vegan food market reflecting on animal welfare, plus a writing contest, pop-up bookshop and goods stalls, and performances for all ages. Championing a 'watch but don't disturb' ethic, it's a space to share how humans and sea life can coexist." } },
  17: { img:"https://tong.visitkorea.or.kr/cms/resource/91/4039191_image2_1.jpg", homepage:"https://www.sgpcanola.com/",
    desc:{ ko:"서귀포시 표선면 가시리 녹산로 일대에서 열리는 유채꽃축제는, 10만㎡에 달하는 유채꽃밭을 거닐며 제주 봄의 정취를 만끽하는 대표 봄 축제다. 드넓게 펼쳐진 노란 유채꽃밭과 녹산로 유채꽃길을 따라 산책하며 제주의 바람과 풍경을 즐기고, 차 없는 거리 운영·원데이 클래스·플리마켓·버스킹·지역 먹거리 등 다양한 부대행사를 만날 수 있다. 탁 트인 배경 덕분에 가족 나들이와 사진 촬영 명소로도 사랑받는, '보고 걷고 즐기는' 봄 여행 코스다.",
      en:"Held along Noksan-ro in Gasiri, Pyoseon, the canola festival lets you wander 100,000㎡ of golden rape-flower fields and soak up Jeju's spring. Strolling the vast yellow fields and the Noksan-ro flower road, you enjoy the island's wind and scenery, plus a car-free street, one-day classes, a flea market, busking and local food. With its wide-open backdrop it's beloved for family outings and photos — a 'see, walk and enjoy' spring travel course." } },
  18: { desc:{ ko:"세계 환경의 날(6월 5일)을 전후해 제주국제컨벤션센터 야외광장에서 열리는 시민참여형 환경 축제다. 환경 체험·전시와 녹색소비 한마당, 버려진 물건을 새롭게 되살리는 업사이클링 체험, 어린이 환경 인형극과 청소년 환경 백일장, 자전거 라이딩과 토크콘서트 등 자원순환과 기후행동을 몸으로 배우는 프로그램이 가득하다. 도민과 관광객이 함께 '2040 플라스틱 제로 제주'를 향한 걸음을 나누는, 환경교육과 실천의 장이다.",
      en:"Around World Environment Day (June 5), this citizen-participation festival takes over the outdoor plaza of ICC Jeju. It's packed with eco exhibits and experiences, a green-consumption fair, upcycling workshops, a children's environmental puppet show, a youth eco-writing contest, bike rides and a talk concert — all teaching circular economy and climate action hands-on. Residents and visitors take steps together toward a '2040 Plastic-Free Jeju.'" } },
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

  /* ---- leaderboard ---- */
  if (url === "/api/leaderboard" && req.method === "GET") {
    const counts = {};
    DB.checkins.forEach(c => { counts[c.userId] = (counts[c.userId] || 0) + 1; });
    const real = Object.entries(counts).map(([uid, count]) => {
      const u = DB.users[uid]; if (!u) return null;
      return { name: u.name, avatar: u.avatar, count, userId: uid };
    }).filter(Boolean);
    const board = [...SEED_BOTS.map(b => ({ ...b })), ...real]
      .sort((a, b) => b.count - a.count);
    return send(res, 200, { leaderboard: board });
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
