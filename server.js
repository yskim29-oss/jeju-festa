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

/* ---------------- storage ---------------- */
function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch (e) { return { users: {}, sessions: {}, checkins: [], reviews: [] }; }
}
let DB = loadDB();
let saveTimer = null;
function saveDB() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(DB, null, 2));
  }, 40);
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

function festivalPublic(f) {
  const revs = reviewsForFestival(f.id);
  const rAvg = revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : f.rate;
  const sAvg = revs.length ? revs.reduce((s, r) => s + r.sustainability, 0) / revs.length : 4.0;
  return { ...f, method: f.method || METHODS[f.id] || "geo", qr: qrFor(f.id),
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
          .filter(f => !curated.has(normTitle(f.name.ko)));   // drop duplicates of curated ones
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

server.listen(PORT, () => {
  console.log(`Jeju Festa server → http://localhost:${PORT}`);
  console.log(TOURAPI_KEY ? "TourAPI key detected — fetching live 제주 festivals…"
                          : "TourAPI key not set — running on the curated festival list. Set TOURAPI_KEY to enable live data.");
});
refreshLive();                                   // initial live fetch
setInterval(refreshLive, 6 * 60 * 60 * 1000);    // refresh every 6h
