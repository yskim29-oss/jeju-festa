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
  {id:1,cat:"eco",green:true,lat:33.3745,lng:126.7710,rate:4.6,stamp:"🌼",
   name:{ko:"가시리 유채꽃 축제",en:"Gasiri Canola Flower Festival"},
   loc:{ko:"서귀포시 표선면 가시리",en:"Gasiri, Seogwipo"},
   start:"2026-04-04",end:"2026-04-12",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"끝없이 펼쳐진 노란 유채꽃밭과 조랑말 방목지를 걷는 봄 대표 축제.",en:"A springtime walk through endless canola fields and pony pastures."},
   sus:{ko:["다회용기 사용 부스 운영","일회용 컵 없는 플리마켓","도보·자전거 이동 권장"],en:["Reusable-cup food booths","Single-use-free flea market","Walking & cycling encouraged"]}},
  {id:2,cat:"tradition",green:true,lat:33.3620,lng:126.3572,rate:4.4,stamp:"🔥",
   name:{ko:"제주 들불축제",en:"Jeju Fire Festival"},
   loc:{ko:"제주시 애월읍 새별오름",en:"Saebyeol Oreum, Jeju City"},
   start:"2026-03-13",end:"2026-03-15",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"오름을 태우던 제주 목축 문화에서 유래한 불의 축제. 밤하늘 불꽃이 장관.",en:"A fire festival rooted in Jeju's grazing culture, with a stunning night blaze."},
   sus:{ko:["다회용기 지원 사업 참여 축제","친환경 셔틀버스 운영","쓰레기 분리배출 캠페인"],en:["Part of the reusable-container support program","Eco shuttle buses","Waste-sorting campaign"]}},
  {id:3,cat:"agri",green:false,lat:33.2530,lng:126.5120,rate:4.2,stamp:"🍊",
   name:{ko:"서귀포 감귤박람회",en:"Seogwipo Tangerine Expo"},
   loc:{ko:"서귀포시 감귤박람회장",en:"Seogwipo Expo Hall"},
   start:"2026-11-06",end:"2026-11-15",
   verify:{ko:"티켓 사진 업로드",en:"Ticket photo upload"},
   desc:{ko:"제주 감귤의 모든 것. 수확 체험과 감귤 가공품 시식이 가득.",en:"All about Jeju tangerines — harvest experiences and tastings galore."},
   sus:{ko:["로컬 농가 직거래 장터","못난이 감귤 업사이클 코너"],en:["Direct-from-farm market","Ugly-tangerine upcycling corner"]}},
  {id:4,cat:"tradition",green:false,lat:33.5163,lng:126.5220,rate:4.5,stamp:"🎭",
   name:{ko:"탐라문화제",en:"Tamna Culture Festival"},
   loc:{ko:"제주시 탑동광장 일대",en:"Tapdong Plaza, Jeju City"},
   start:"2026-10-09",end:"2026-10-13",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"제주 고유의 신화·민속·예술이 어우러진 제주 최대 전통문화 축제.",en:"Jeju's largest traditional festival of myth, folk and art."},
   sus:{ko:["다회용기 푸드존 운영","전통 공예 새활용 워크숍"],en:["Reusable-container food zone","Traditional-craft upcycling workshops"]}},
  {id:5,cat:"eco",green:true,lat:33.4581,lng:126.9425,rate:4.7,stamp:"🌊",
   name:{ko:"성산일출봉 해녀축제",en:"Seongsan Haenyeo Festival"},
   loc:{ko:"서귀포시 성산일출봉",en:"Seongsan Ilchulbong"},
   start:"2026-09-19",end:"2026-09-21",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"유네스코 해녀 문화를 기리는 축제. 물질 시연과 해산물 로컬푸드.",en:"Honoring UNESCO haenyeo culture with diving demos and local seafood."},
   sus:{ko:["해양 정화 플로깅 프로그램","지속가능 어업 로컬푸드","다회용기 사용 부스"],en:["Coastal plogging cleanup","Sustainable-fishery local food","Reusable-container booths"]}},
  {id:6,cat:"eco",green:true,lat:33.1690,lng:126.2712,rate:4.3,stamp:"🌾",
   name:{ko:"가파도 청보리 축제",en:"Gapado Green Barley Festival"},
   loc:{ko:"서귀포시 가파도",en:"Gapado Island"},
   start:"2026-04-18",end:"2026-05-10",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"바람에 일렁이는 청보리밭으로 유명한 탄소중립 섬 축제.",en:"A carbon-neutral island festival famous for waving green barley fields."},
   sus:{ko:["탄소중립 섬 지정","차 없는 도보 여행","재생에너지 운영"],en:["Designated carbon-neutral island","Car-free walking tour","Renewable-energy powered"]}},
  {id:7,cat:"leisure",green:false,lat:33.3617,lng:126.5292,rate:4.1,stamp:"❄️",
   name:{ko:"한라산 눈꽃 트레킹",en:"Hallasan Snow Trek"},
   loc:{ko:"한라산국립공원",en:"Hallasan National Park"},
   start:"2026-01-17",end:"2026-02-08",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"겨울 한라산의 상고대와 설경을 즐기는 트레킹 프로그램.",en:"A trekking program through Hallasan's winter frost and snowscapes."},
   sus:{ko:["국립공원 저지대 탐방로 이용","쓰레기 되가져오기 캠페인"],en:["Low-impact park trails","Pack-it-out waste campaign"]}},
  {id:8,cat:"eco",green:true,lat:33.2790,lng:126.6600,rate:4.5,stamp:"🌺",
   name:{ko:"위미 동백꽃 축제",en:"Wimi Camellia Festival"},
   loc:{ko:"서귀포시 남원읍 위미리",en:"Wimi-ri, Seogwipo"},
   start:"2026-12-05",end:"2026-12-20",
   verify:{ko:"티켓 사진 업로드",en:"Ticket photo upload"},
   desc:{ko:"붉은 동백이 마을을 물들이는 초겨울 감성 축제.",en:"An early-winter festival where red camellias color the village."},
   sus:{ko:["마을 주민 운영 로컬 마켓","다회용기 카페 운영"],en:["Village-run local market","Reusable-cup cafés"]}},
  {id:9,cat:"agri",green:true,lat:33.3055,lng:126.2895,rate:4.0,stamp:"🍵",
   name:{ko:"오설록 녹차밭 페스타",en:"Osulloc Green Tea Festa"},
   loc:{ko:"서귀포시 안덕면 서광리",en:"Seogwang-ri, Seogwipo"},
   start:"2026-05-23",end:"2026-05-31",
   verify:{ko:"QR 코드 스캔",en:"QR code scan"},
   desc:{ko:"드넓은 녹차밭에서 즐기는 티 클래스와 로컬 디저트 마켓.",en:"Tea classes and a local dessert market across sprawling green-tea fields."},
   sus:{ko:["찻잎 퇴비화 프로그램","텀블러 리필 스테이션"],en:["Tea-leaf composting","Tumbler refill stations"]}},
  {id:10,cat:"leisure",green:false,lat:33.2460,lng:126.5620,rate:4.2,stamp:"🚴",
   name:{ko:"제주 올레 걷기 축제",en:"Jeju Olle Walking Festival"},
   loc:{ko:"제주 올레길 일대",en:"Jeju Olle Trails"},
   start:"2026-11-13",end:"2026-11-15",
   verify:{ko:"위치 기반 체크인",en:"Location check-in"},
   desc:{ko:"제주 해안 올레길을 함께 걷는 3일간의 대표 도보 축제.",en:"A three-day flagship walking festival along Jeju's coastal Olle trails."},
   sus:{ko:["무동력 도보 여행","코스별 플로깅 운영","다회용기 간식 부스"],en:["Human-powered travel only","Route-by-route plogging","Reusable-container snack booths"]}}
];

const SEED_REVIEWS = {
  1:[{name:"바다별",avatar:"🏄",rating:5,sustainability:5,text:{ko:"유채꽃밭 인생샷! 다회용기 부스도 좋았어요",en:"Best flower photos ever, loved the reusable booths"}},
     {name:"제주러버",avatar:"🌴",rating:4,sustainability:4,text:{ko:"주차만 좀 힘들었지만 만족",en:"Parking was tough but worth it"}}],
  2:[{name:"불구경단",avatar:"🧗",rating:5,sustainability:4,text:{ko:"밤 불꽃 진짜 압도적이에요",en:"The night blaze is jaw-dropping"}}],
  5:[{name:"해녀팬",avatar:"🌊",rating:5,sustainability:5,text:{ko:"물질 시연 감동적. 플로깅도 참여했어요",en:"The diving demo was moving, joined the plogging too"}}],
  6:[{name:"청보리",avatar:"🚴",rating:4,sustainability:5,text:{ko:"차 없는 섬이라 공기부터 다름",en:"Car-free island — even the air feels different"}}]
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
const METHODS = {1:"geo",2:"qr",3:"ticket",4:"geo",5:"qr",6:"geo",7:"geo",8:"ticket",9:"qr",10:"geo"};
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
  return { ...f, method: METHODS[f.id], qr: qrFor(f.id),
    ratingAvg: +rAvg.toFixed(1), susAvg: +sAvg.toFixed(1), reviewCount: revs.length };
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
    return send(res, 200, { festivals: FESTIVALS.map(festivalPublic) });
  }

  const fMatch = url.match(/^\/api\/festivals\/(\d+)$/);
  if (fMatch && req.method === "GET") {
    const f = FESTIVALS.find(x => x.id === +fMatch[1]);
    if (!f) return send(res, 404, { error: "not_found" });
    return send(res, 200, { festival: festivalPublic(f), reviews: reviewsForFestival(f.id) });
  }

  const ciMatch = url.match(/^\/api\/festivals\/(\d+)\/checkin$/);
  if (ciMatch && req.method === "POST") {
    const u = sessionUser(req);
    if (!u) return send(res, 401, { error: "unauthorized" });
    const fid = +ciMatch[1];
    const f = FESTIVALS.find(x => x.id === fid);
    if (!f) return send(res, 404, { error: "not_found" });
    const method = METHODS[fid];

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
    if (!FESTIVALS.some(f => f.id === fid)) return send(res, 404, { error: "not_found" });
    const rating = Math.max(1, Math.min(5, +body.rating || 5));
    const sustainability = Math.max(1, Math.min(5, +body.sustainability || 5));
    const text = (body.text || "").toString().slice(0, 400);
    const rev = { id: newId(), festivalId: fid, userId: u.id, name: u.name, avatar: u.avatar,
      rating, sustainability, text: { ko: text, en: text }, at: Date.now() };
    DB.reviews.unshift(rev);
    saveDB();
    return send(res, 200, { review: rev, festival: festivalPublic(FESTIVALS.find(f => f.id === fid)) });
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

server.listen(PORT, () => console.log(`Jeju Festa server → http://localhost:${PORT}`));
