/* ================= i18n ================= */
const STR = {
  brand:{ko:"제주 축제 도장",en:"Jeju Festa Stamp"},
  ob_title:{ko:"제주와 자연을\n함께 지켜요",en:"Protecting Jeju &\nNature Together"},
  ob_desc:{ko:"제주의 지속가능한 축제를 다니며 방문 도장을 모으고, 제주 지도를 완성하는 스탬프 투어.",en:"A stamp tour: visit Jeju's sustainable festivals, collect check-in stamps, and complete your map."},
  members:{ko:"1.7만+ 명의 여행자와 함께",en:"17K+ travelers with us"},
  f_name:{ko:"닉네임",en:"Nickname"},f_avatar:{ko:"아바타",en:"Avatar"},
  f_email:{ko:"이메일",en:"Email"},f_pw:{ko:"비밀번호",en:"Password"},
  authTitle_login:{ko:"다시 오셨네요",en:"Welcome back"},authTitle_signup:{ko:"여행 시작하기",en:"Start your trip"},
  authLead_login:{ko:"로그인하고 모은 도장을 이어서 확인하세요.",en:"Log in to continue collecting stamps."},
  authLead_signup:{ko:"계정을 만들고 제주 축제 도장을 모아보세요.",en:"Create an account and start collecting."},
  btn_login:{ko:"로그인",en:"Log in"},btn_signup:{ko:"가입하고 시작하기",en:"Sign up & start"},
  switch_to_signup_txt:{ko:"계정이 없으신가요?",en:"No account yet?"},switch_to_signup_btn:{ko:"회원가입",en:"Sign up"},
  switch_to_login_txt:{ko:"이미 계정이 있으신가요?",en:"Already registered?"},switch_to_login_btn:{ko:"로그인",en:"Log in"},
  demo_hint:{ko:"둘러보고 싶으신가요?",en:"Just looking around?"},demo_btn:{ko:"데모 계정으로 입장",en:"Enter demo account"},
  err_email_password_required:{ko:"이메일과 비밀번호를 입력하세요.",en:"Enter email and password."},
  err_password_too_short:{ko:"비밀번호는 4자 이상이어야 해요.",en:"Password must be 4+ characters."},
  err_email_taken:{ko:"이미 가입된 이메일이에요.",en:"That email is already registered."},
  err_invalid_credentials:{ko:"이메일 또는 비밀번호가 올바르지 않아요.",en:"Incorrect email or password."},
  err_network:{ko:"서버에 연결할 수 없어요.",en:"Could not reach the server."},
  err_google_failed:{ko:"구글 로그인에 실패했어요.",en:"Google sign-in failed."},
  or:{ko:"또는",en:"or"},

  nav_home:{ko:"홈",en:"Home"},nav_map:{ko:"지도",en:"Map"},nav_search:{ko:"검색",en:"Search"},nav_my:{ko:"마이",en:"My"},nav_rank:{ko:"랭킹",en:"Ranking"},nav_faq:{ko:"FAQ",en:"FAQ"},
  faq_eyebrow:{ko:"도움말 센터",en:"Help center"},
  faq_title:{ko:"무엇이 궁금하세요?",en:"How can we help?"},
  faq_sub:{ko:"점수는 어떻게 매겨질까요? 가장 많이 받는 질문을 모았어요.",en:"How are the scores decided? Here's what people ask us most."},
  faq_footer:{ko:"자주 묻는 질문",en:"FAQ"},
  faq_more:{ko:"더 궁금한 점이 있나요?",en:"Still have a question?"},
  faq_more_sub:{ko:"홈 하단의 문의 카드로 남겨주시면 확인하고 답해드릴게요.",en:"Leave it in the report card at the bottom of the home page and we'll get back to you."},
  faq_more_btn:{ko:"문의 남기기",en:"Send a message"},
  detail_how_scored:{ko:"점수는 어떻게 매겨지나요?",en:"How are these scored?"},
  hero_eyebrow:{ko:"제주 지속가능 축제",en:"Jeju Sustainable Festivals"},
  hero_h1:{ko:"자연을 지키고\n축제를 즐겨요.",en:"Save Nature,\nEnjoy Festivals."},
  hero_email:{ko:"이메일을 입력하세요",en:"Enter your e-mail"},
  subscribe:{ko:"구독",en:"Subscribe"},
  hero_cta:{ko:"축제 지도 보기",en:"Explore the map"},
  home_stats_eyebrow:{ko:"지금까지 제주 여행자들과 함께",en:"Together with Jeju travelers so far"},
  home_stats_sub:{ko:"도장 하나하나가 모여 만든 숫자예요.",en:"Every number here is a stamp someone earned."},
  home_stats_live:{ko:"실시간 집계",en:"Updated live"},home_stats_ppl:{ko:"명",en:""},
  home_users:{ko:"함께한 여행자",en:"Travelers"},home_visits:{ko:"누적 축제 방문",en:"Festival visits"},
  home_signups:{ko:"가입한 회원",en:"Members joined"},home_views:{ko:"사이트 방문",en:"Site views"},
  hero_chip:{ko:"우리와 함께한 여행자들",en:"Our volunteers"},
  hero_social:{ko:"소셜에서 만나요",en:"Find us on social"},
  hero_cap:{ko:"제주의 자연과 축제를 함께 지켜가는 여행자 커뮤니티입니다.",en:"A traveler community protecting Jeju's nature & festivals."},
  tag_ocean:{ko:"해양 보호",en:"Ocean Care"},tag_forest:{ko:"숲 보전",en:"Forests"},
  greener_title:{ko:"더 깨끗하고 푸른 제주를 만들어요!",en:"Let's Make Jeju Cleaner & Greener!"},
  greener_sub:{ko:"지속가능한 축제를 다니며 도장을 모으고, 함께 자연을 지켜요.",en:"Visit sustainable festivals, collect stamps, protect nature together."},
  view_map:{ko:"지도 보기",en:"View Map"},learn_more:{ko:"더 알아보기",en:"Learn More"},
  p_we:{ko:"우리는",en:"We"},p_protect:{ko:"지켜요",en:"Protect"},p_nature:{ko:"자연을",en:"Nature"},
  inits_title:{ko:"이달의 축제",en:"Festivals this month"},
  inits_sub:{ko:"카테고리·정렬로 원하는 축제를 찾아보세요",en:"Filter & sort to find festivals"},
  col_title:{ko:"축제",en:"Title"},col_tags:{ko:"태그",en:"Tags"},col_date:{ko:"날짜",en:"Date"},
  problems_title:{ko:"주목할 축제",en:"Featured festivals"},
  problems_sub:{ko:"지금 인증할 수 있는 대표 축제들",en:"Top festivals to check in now"},
  explore:{ko:"자세히 보기",en:"Explore"},
  newsletter:{ko:"뉴스레터",en:"newsletter"},
  nl_title:{ko:"뉴스레터를 구독하고 축제·프로젝트 소식을 받아보세요.",en:"Subscribe to get the latest festivals, projects & initiatives."},
  subscribed:{ko:"구독 완료! 고마워요 🌿",en:"Subscribed! Thank you 🌿"},
  sub_invalid:{ko:"이메일 주소를 확인해주세요",en:"Please check your email address"},
  sub_failed:{ko:"잠시 후 다시 시도해주세요",en:"Something went wrong — please try again"},
  report_eyebrow:{ko:"버그 신고",en:"report a bug"},
  report_title:{ko:"버그를 발견하셨나요? 알려주세요.",en:"Found a bug? Let us know."},
  report_sub:{ko:"이상한 점이나 개선 아이디어를 자유롭게 남겨주세요. 개발자에게 바로 전달됩니다.",en:"Tell us anything broken or any idea to improve — it goes straight to the developer."},
  report_ph:{ko:"무엇이 잘못됐는지 알려주세요…",en:"Describe what went wrong…"},
  report_email_ph:{ko:"회신 받을 이메일 (선택)",en:"Your email for a reply (optional)"},
  report_btn:{ko:"신고 보내기",en:"Send report"},
  report_sent:{ko:"신고 접수 완료! 감사합니다 🙏",en:"Report sent! Thank you 🙏"},
  report_empty:{ko:"내용을 입력해주세요",en:"Please enter a message"},
  cd_ends:{ko:"이번 시즌 마감까지",en:"Season ends in"},
  cd_dday:{ko:"일 남음",en:"days left"},cd_ontrack:{ko:"시즌 진행 중",en:"Season live"},cd_soon:{ko:"🔥 마감 임박",en:"🔥 Ending soon"},cd_last:{ko:"⏳ 오늘 마감",en:"⏳ Ends today"},cd_elapsed:{ko:"경과",en:"elapsed"},
  impact_title:{ko:"우리가 함께 만든 변화",en:"The change we made together"},
  impact_sub:{ko:"제주 여행자들이 지속가능 축제를 즐기며 남긴 발자국",en:"The footprint Jeju travelers left enjoying sustainable festivals"},
  im_stamps:{ko:"모은 도장",en:"Stamps earned"},im_travelers:{ko:"함께한 여행자",en:"Travelers"},im_green:{ko:"지속가능 방문",en:"Green visits"},im_co2:{ko:"CO₂ 절감 (추정)",en:"CO₂ saved (est.)"},im_reviews:{ko:"남긴 후기",en:"Reviews"},
  impact_note:{ko:"* CO₂ 절감량은 차 없는 이동·다회용기 사용을 기준으로 한 추정치입니다.",en:"* CO₂ estimate assumes car-free travel and reusable containers per visit."},
  my_footprint:{ko:"나의 발자국",en:"My footprint"},
  mf_visited:{ko:"방문한 축제",en:"Festivals visited"},mf_green:{ko:"지속가능 방문",en:"Green visits"},mf_co2:{ko:"CO₂ 절감 (추정)",en:"CO₂ saved (est.)"},mf_rank:{ko:"시즌 순위",en:"Season rank"},
  cd_week:{ko:"주",en:"wk"},cd_day:{ko:"일",en:"d"},cd_hour:{ko:"시간",en:"hr"},cd_min:{ko:"분",en:"min"},cd_sec:{ko:"초",en:"sec"},

  map_title:{ko:"제주 지도 완성하기",en:"Complete your Jeju map"},
  map_sub:{ko:"핀을 눌러 축제로 이동하고 방문 인증하세요",en:"Tap a pin to open a festival & check in"},
  map_slots:{ko:"도장 슬롯",en:"Stamp slots"},
  slot_hint:{ko:"5개를 모아 지도를 완성해요",en:"Collect 5 to complete the map"},
  map_list_head:{ko:"모든 축제",en:"All festivals"},visited:{ko:"방문",en:"Visited"},
  tip_done:{ko:"방문완료",en:"Visited"},
  search_title:{ko:"축제 검색",en:"Search festivals"},search_sub:{ko:"축제명·지역·키워드로 검색하세요",en:"Search by name, place or keyword"},
  my_title:{ko:"마이 페이지",en:"My page"},my_rewards:{ko:"리워드 현황",en:"Rewards"},my_goal:{ko:"목표",en:"Goal"},logout:{ko:"로그아웃",en:"Log out"},
  my_stamps:{ko:"내가 모은 도장",en:"My stamps"},
  st_stamps:{ko:"모은 도장",en:"Stamps"},st_progress:{ko:"진행률",en:"Progress"},st_rank:{ko:"내 순위",en:"My rank"},
  intro_skip:{ko:"건너뛰기",en:"Skip"},intro_scroll:{ko:"아래로 스크롤",en:"Scroll down"},intro_replay:{ko:"소개 다시 보기",en:"Watch the intro again"},intro_start:{ko:"시작하기",en:"Get started"},
  intro_1_t:{ko:"제주의 축제를,\n지속가능하게",en:"Jeju's festivals,\nmade sustainable"},
  intro_1_s:{ko:"제주 지속가능 축제 스탬프 투어에 오신 걸 환영해요.",en:"Welcome to the Jeju sustainable-festival stamp tour."},
  intro_2_k:{ko:"왜 만들었나요",en:"Why we built it"},
  intro_2_t:{ko:"축제는 많지만\n흩어져 있어요",en:"So many festivals,\nall scattered"},
  intro_2_s:{ko:"제주엔 매년 수많은 축제가 열리지만 정보가 흩어져 있어 한 번 가고 마는 경우가 많아요. 한곳에 모으고, 여러 축제를 다니게 만들고 싶었어요.",en:"Jeju holds countless festivals each year, but the info is scattered and most people go just once. We wanted one place that gets you exploring many."},
  intro_3_k:{ko:"우리의 목표",en:"Our mission"},
  intro_3_t:{ko:"2040\n플라스틱 제로 제주",en:"2040\nPlastic-Free Jeju"},
  intro_3_s:{ko:"다회용기 · 플로깅 · 로컬푸드 — 지속가능한 축제를 즐기며 함께 제주의 자연을 지켜요.",en:"Reusable cups, plogging, local food — enjoy sustainable festivals and protect Jeju's nature together."},
  intro_4_k:{ko:"어떻게",en:"How it works"},
  intro_4_t:{ko:"다니고, 인증하고,\n도장을 모아요",en:"Visit, check in,\ncollect stamps"},
  intro_step1:{ko:"축제 찾기",en:"Find a festival"},intro_step2:{ko:"방문 인증",en:"Check in"},intro_step3:{ko:"지도 완성",en:"Complete the map"},
  intro_5_t:{ko:"지금,\n지도를 완성하러 가요",en:"Now — go\ncomplete the map"},
  intro_5_s:{ko:"5개의 도장을 모아 나만의 제주 지도를 완성하세요.",en:"Collect 5 stamps to complete your own map of Jeju."},
  rank_title:{ko:"랭킹",en:"Ranking"},rank_sub:{ko:"이번 시즌 도장을 가장 많이 모은 여행자들",en:"Top stamp collectors this season"},
  back:{ko:"뒤로",en:"Back"},
  all:{ko:"전체",en:"All"},eco:{ko:"생태·환경",en:"Eco"},tradition:{ko:"전통문화",en:"Tradition"},agri:{ko:"농수산물",en:"Local food"},leisure:{ko:"레저·체험",en:"Leisure"},
  green_only:{ko:"지속가능",en:"Sustainable"},green_badge:{ko:"지속가능",en:"Sustainable"},
  sort_date:{ko:"날짜순",en:"By date"},sort_rating:{ko:"평점순",en:"Top rated"},sort_sus:{ko:"지속가능순",en:"Sustainable"},sort_name:{ko:"이름순",en:"By name"},
  rating:{ko:"평점",en:"Rating"},sustainability:{ko:"지속가능 체감도",en:"Sustainability"},
  sus_points:{ko:"지속가능 포인트",en:"Sustainability highlights"},reviews:{ko:"리뷰",en:"Reviews"},
  event_info:{ko:"행사 정보",en:"Event info"},official_site:{ko:"공식 홈페이지",en:"Official site"},
  web_search:{ko:"웹에서 찾아보기",en:"Look it up online"},about_festival:{ko:"축제 소개",en:"About the festival"},
  when:{ko:"기간",en:"When"},where:{ko:"장소",en:"Where"},verify_method:{ko:"인증 방법",en:"Check-in"},
  write_review:{ko:"리뷰 남기기",en:"Write a review"},rv_rating:{ko:"평점",en:"Rating"},rv_sus:{ko:"지속가능 체감도",en:"Sustainability"},
  rv_placeholder:{ko:"축제는 어땠나요? (선택)",en:"How was it? (optional)"},rv_submit:{ko:"리뷰 등록",en:"Post review"},rv_thanks:{ko:"리뷰 고마워요!",en:"Thanks for the review!"},
  verify_do:{ko:"방문 인증하고 도장 받기",en:"Check in & get a stamp"},verify_done:{ko:"인증 완료 · 도장 획득",en:"Checked in · stamp earned"},
  lvl0:{ko:"새내기 여행자",en:"Rookie traveler"},lvl1:{ko:"제주 탐험가",en:"Jeju explorer"},lvl3:{ko:"축제 마스터",en:"Festival master"},lvl5:{ko:"제주 지도 완성!",en:"Map complete!"},
  ms_title:{ko:"도장 획득!",en:"Stamp earned!"},ms_ok:{ko:"좋아요!",en:"Nice!"},
  r1_t:{ko:"참여 배지",en:"Starter badge"},r1_d:{ko:"첫 축제 인증 시 지급",en:"For your first check-in"},
  r3_t:{ko:"다회용기 할인 쿠폰",en:"Reusable-cup discount"},r3_d:{ko:"축제 3곳 인증 · 부스 10% 할인",en:"3 check-ins · 10% off booths"},
  r5_t:{ko:"제주 굿즈 세트",en:"Jeju goods set"},r5_d:{ko:"지도 완성 · 감귤 에코백 + 스티커",en:"Map complete · tote + stickers"},
  locked:{ko:"잠김",en:"Locked"},unlocked:{ko:"획득!",en:"Unlocked!"},reward_toast:{ko:"리워드 잠금 해제!",en:"Reward unlocked!"},
  me:{ko:"나",en:"Me"},no_result:{ko:"검색 결과가 없어요.",en:"No results found."},no_fest:{ko:"이 달에는 등록된 축제가 없어요.",en:"No festivals this month."},

  /* ---- check-in methods ---- */
  method_geo:{ko:"위치 인증",en:"Location"},method_qr:{ko:"QR 인증",en:"QR scan"},method_ticket:{ko:"티켓 인증",en:"Ticket"},
  ci_geo_title:{ko:"위치 기반 체크인",en:"Location check-in"},ci_geo_sub:{ko:"현장에서 GPS로 인증",en:"Verify by GPS on-site"},
  ci_qr_title:{ko:"QR 코드 스캔",en:"QR code scan"},ci_qr_sub:{ko:"현장 QR을 카메라로 스캔",en:"Scan the on-site QR"},
  ci_ticket_title:{ko:"티켓 사진 업로드",en:"Ticket photo upload"},ci_ticket_sub:{ko:"입장 티켓 사진으로 인증",en:"Verify with your ticket photo"},
  cam_starting:{ko:"카메라 준비 중…",en:"Starting camera…"},
  cam_denied:{ko:"카메라를 사용할 수 없어요. 아래에 코드를 직접 입력하세요.",en:"Camera unavailable. Enter the code below."},
  qr_or:{ko:"또는 코드 직접 입력",en:"or enter the code"},
  qr_demo_hint:{ko:"데모: 이 축제의 코드는 {code} 입니다.",en:"Demo: this festival's code is {code}."},
  confirm:{ko:"확인",en:"Confirm"},cancel:{ko:"취소",en:"Cancel"},close:{ko:"닫기",en:"Close"},
  cal_hint:{ko:"날짜를 눌러 그날의 축제를 확인하세요",en:"Tap a date to see that day's festivals"},
  geo_intro:{ko:"버튼을 눌러 현재 위치로 인증하세요.",en:"Tap the button to verify your location."},
  geo_locate:{ko:"내 위치 확인하기",en:"Check my location"},
  geo_locating:{ko:"위치 확인 중…",en:"Locating…"},
  geo_here:{ko:"현장 근처예요! (약 {d}km) 인증할 수 있어요.",en:"You're near the site (~{d}km). Ready to check in."},
  geo_far:{ko:"현장에서 약 {d}km 떨어져 있어요.",en:"You're about {d}km from the site."},
  geo_denied:{ko:"위치를 가져올 수 없어요.",en:"Couldn't get your location."},
  geo_confirm:{ko:"이 위치로 인증하기",en:"Check in here"},
  geo_demo:{ko:"데모: 현장 방문으로 인증",en:"Demo: simulate on-site check-in"},
  ticket_drop:{ko:"티켓 사진을 선택하세요",en:"Choose your ticket photo"},
  ticket_hint:{ko:"JPG·PNG · 갤러리 또는 카메라",en:"JPG·PNG · gallery or camera"},
  ticket_redo:{ko:"다시 선택",en:"Reselect"},ticket_confirm:{ko:"이 티켓으로 인증하기",en:"Check in with this ticket"},
  err_bad_qr:{ko:"코드가 일치하지 않아요. 다시 시도하세요.",en:"Code doesn't match. Try again."},
  err_too_far:{ko:"현장에서 너무 멀어요 (약 {d}km).",en:"Too far from the site (~{d}km)."},
  err_no_photo:{ko:"먼저 티켓 사진을 올려주세요.",en:"Please upload a ticket photo first."},
  err_checkin:{ko:"인증에 실패했어요. 다시 시도하세요.",en:"Check-in failed. Try again."}
};
const MON={ko:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],en:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]};
const CATS=["eco","tradition","agri","leisure"];
const AVATARS=["🧑‍🌾","🏄","🧗","🚴","👩‍🎨","🧑‍🚀","🐬","🌴"];
const CATIMG={
  eco:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=60",
  tradition:"https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=800&q=60",
  agri:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=60",
  leisure:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
};
const FIMG={ // signature overrides by festival id
  2:"https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60",
  5:"https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=800&q=60",
  7:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
  15:"https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=800&q=60",
  16:"https://images.unsplash.com/photo-1607153333879-c174d265f1d2?auto=format&fit=crop&w=800&q=60",
  17:"https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=60"
};
function festImg(f){ return (f&&f.img)||(f&&FIMG[f.id])||(f&&CATIMG[f.cat])||CATIMG.eco; }
function liveBadge(f){ return f&&f.live?`<span class="tagpill live">● LIVE</span>`:""; }
function festLink(f){
  if(f&&f.homepage) return {url:f.homepage, label:t("official_site")};
  return {url:"https://search.naver.com/search.naver?query="+encodeURIComponent("제주 "+tv(f.name)+" 축제"), label:t("web_search")};
}
const CATCOLOR={eco:"#2F9E62",tradition:"#B26A2E",agri:"#C9A227",leisure:"#2E86C7"};

/* ================= state ================= */
let lang=localStorage.getItem("jf_lang")||"ko";
let token=localStorage.getItem("jf_token")||null;
let ME=null, FEST=[], curMonth=7, curYear=2026;   // default: August
let catFilter="all", greenOnly=false, sortMode="date";
let authMode="login", pickedAvatar="🧑‍🌾";
let map=null, markers=[], mapTiles=null, mapTileLang=null;

/* ================= api ================= */
async function api(path, opts={}){
  const headers={"Content-Type":"application/json"};
  if(token) headers["Authorization"]="Bearer "+token;
  const res=await fetch("/api"+path,{...opts,headers});
  let data={}; try{ data=await res.json(); }catch(e){}
  if(!res.ok) throw {status:res.status, ...data};
  return data;
}

/* ================= helpers ================= */
function t(k){ return (STR[k]||{})[lang]||k; }
function tv(o){ return o ? (o[lang]||o.ko) : ""; }
function dObj(s){ const [y,m,d]=s.split("-").map(Number); return {y,m:m-1,d}; }
function fmtRange(f){ const a=dObj(f.start),b=dObj(f.end),mm=MON[lang];
  if(a.m===b.m&&a.d===b.d) return `${mm[a.m]} ${a.d}`;
  return a.m===b.m?`${mm[a.m]} ${a.d}–${b.d}`:`${mm[a.m]} ${a.d} – ${mm[b.m]} ${b.d}`; }
function stamps(){ return ME?ME.stamps:[]; }
function has(id){ return stamps().includes(id); }
function svg(id,cls){ return `<svg class="${cls||'icon'}" viewBox="0 0 24 24"><use href="#${id}"/></svg>`; }
function esc(s){ return (s||"").replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c])); }
function methodIcon(m){ return {geo:"i-target",qr:"i-qr",ticket:"i-camera"}[m]; }
function haversineKm(a,b,c,d){ const R=6371,r=x=>x*Math.PI/180;
  const dLat=r(c-a),dLng=r(d-b); const h=Math.sin(dLat/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)); }
function nl2br(s){ return esc(s).replace(/\n/g,"<br>"); }

/* ================= auth ================= */
function renderAuthAvatars(){
  const w=document.getElementById("avatarPick"); w.innerHTML="";
  AVATARS.forEach(a=>{ const b=document.createElement("button"); b.type="button"; b.textContent=a;
    if(a===pickedAvatar) b.className="on"; b.onclick=()=>{pickedAvatar=a;renderAuthAvatars();}; w.appendChild(b); });
}
function setAuthMode(m){
  authMode=m;
  document.getElementById("authTitle").textContent=t("authTitle_"+m);
  document.getElementById("authLead").textContent=t("authLead_"+m);
  document.getElementById("authBtn").textContent=t(m==="login"?"btn_login":"btn_signup");
  document.getElementById("signupExtra").classList.toggle("hidden",m==="login");
  document.getElementById("switchTxt").textContent=t(m==="login"?"switch_to_signup_txt":"switch_to_login_txt");
  document.getElementById("switchBtn").textContent=t(m==="login"?"switch_to_signup_btn":"switch_to_login_btn");
  hideAuthErr();
}
function showAuthErr(key){ const e=document.getElementById("authErr");
  e.textContent=STR["err_"+key]?t("err_"+key):t("err_network"); e.classList.add("show"); }
function hideAuthErr(){ document.getElementById("authErr").classList.remove("show"); }
async function submitAuth(){
  hideAuthErr();
  const email=document.getElementById("inEmail").value.trim();
  const password=document.getElementById("inPw").value;
  const btn=document.getElementById("authBtn"); btn.disabled=true;
  try{
    let data;
    if(authMode==="signup"){
      const name=document.getElementById("inName").value.trim();
      data=await api("/signup",{method:"POST",body:JSON.stringify({email,password,name,avatar:pickedAvatar})});
    }else data=await api("/login",{method:"POST",body:JSON.stringify({email,password})});
    token=data.token; ME=data.user; localStorage.setItem("jf_token",token);
    await enterApp();
  }catch(err){ showAuthErr(err.error||"network"); }
  finally{ btn.disabled=false; }
}
async function demoLogin(){
  hideAuthErr();
  const email="demo@jeju.festa", password="demo1234";
  try{
    let data;
    try{ data=await api("/login",{method:"POST",body:JSON.stringify({email,password})}); }
    catch(e){ data=await api("/signup",{method:"POST",body:JSON.stringify({email,password,name:lang==="ko"?"제주 여행자":"Jeju Traveler",avatar:"🐬"})}); }
    token=data.token; ME=data.user; localStorage.setItem("jf_token",token); await enterApp();
  }catch(err){ showAuthErr(err.error||"network"); }
}
async function logout(){
  try{ await api("/logout",{method:"POST"}); }catch(e){}
  token=null; ME=null; localStorage.removeItem("jf_token");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("auth").classList.remove("hidden");
  document.getElementById("inPw").value="";
  setAuthMode("login");   // always return to the login form, not signup
}

/* ================= boot ================= */
async function enterApp(){
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  const data=await api("/festivals"); FEST=data.festivals;
  pickDefaultMonth();
  applyStatic(); updateHeader(); go("home");
  if(!window._festTimer) window._festTimer=setInterval(refreshFestivals, 300000); // live data every 5 min
}
async function refreshFestivals(){
  try{
    const d=await api("/festivals"); FEST=d.festivals;
    const v=document.querySelector("section.view.on"); if(!v) return;
    const id=v.id.replace("v-","");
    if(id==="map") renderMap(); else if(id==="home"){ renderInits(); renderPcards(); } else if(id==="search") renderSearch();
  }catch(e){}
}
async function boot(){
  lang=localStorage.getItem("jf_lang")||"ko";
  document.documentElement.lang=lang;
  document.getElementById("langKo").classList.toggle("on",lang==="ko");
  document.getElementById("langEn").classList.toggle("on",lang==="en");
  renderAuthAvatars(); setAuthMode("login"); applyStatic();
  document.querySelectorAll(".navlinks button").forEach(b=>b.addEventListener("click",()=>go(b.getAttribute("data-nav"))));
  document.getElementById("authBtn").onclick=submitAuth;
  document.getElementById("switchBtn").onclick=()=>setAuthMode(authMode==="login"?"signup":"login");
  document.getElementById("demoBtn").onclick=demoLogin;
  document.getElementById("inPw").addEventListener("keydown",e=>{if(e.key==="Enter")submitAuth();});
  api("/view",{method:"POST"}).catch(()=>{});   // count this site load as a page view
  if(!localStorage.getItem("jf_intro_seen")) showIntro();   // first-visit onboarding
  initGoogle();   // shows a Google button if GOOGLE_CLIENT_ID is configured
  if(token){ try{ const d=await api("/me"); ME=d.user; await enterApp(); return; }catch(e){ token=null; localStorage.removeItem("jf_token"); } }
}

/* ================= static text / lang ================= */
function applyStatic(){
  document.querySelectorAll("[data-t]").forEach(el=>{
    const k=el.getAttribute("data-t");
    if(el.hasAttribute("data-nl")||k==="ob_title"||k==="hero_h1"){ el.innerHTML=nl2br(t(k)); }
    else el.textContent=t(k);
  });
  document.querySelectorAll("[data-tph]").forEach(el=>el.placeholder=t(el.getAttribute("data-tph")));
  const h1=document.getElementById("heroH1"); if(h1) h1.innerHTML=nl2br(t("hero_h1"));
  const si=document.getElementById("searchInput"); if(si) si.placeholder=t("search_title");
  buildSortSelects();
  if(document.getElementById("app").classList.contains("hidden")) setAuthMode(authMode);
}
function buildSortSelects(){
  const opts=[["date","sort_date"],["rating","sort_rating"],["sus","sort_sus"],["name","sort_name"]];
  ["sortSel","searchSort"].forEach(id=>{ const s=document.getElementById(id); if(!s) return;
    const cur=s.value||sortMode; s.innerHTML=opts.map(([v,k])=>`<option value="${v}">${t(k)}</option>`).join(""); s.value=cur; });
}
function setLang(l){
  lang=l; localStorage.setItem("jf_lang",l); document.documentElement.lang=l;
  document.getElementById("langKo").classList.toggle("on",l==="ko");
  document.getElementById("langEn").classList.toggle("on",l==="en");
  applyStatic();
  const active=document.querySelector("section.view.on").id.replace("v-","");
  if(active==="detail" && curDetail) openDetail(curDetail); else go(active);
}

/* ================= nav ================= */
const NAV=["home","map","search","my","rank","faq"];
function go(view,fromPop){
  document.querySelectorAll("section.view").forEach(s=>s.classList.remove("on"));
  document.getElementById("v-"+view).classList.add("on");
  document.querySelectorAll(".navlinks button, .navdrop button").forEach(b=>b.classList.toggle("on",b.getAttribute("data-nav")===view));
  window.scrollTo({top:0,behavior:"smooth"});
  if(view==="home") renderHome();
  if(view==="map") renderMap();
  if(view==="search") renderSearch();
  if(view==="my") renderMy();
  if(view==="rank") renderRank(); else stopRankCountdown();
  if(view==="faq") renderFaq();
  route({view},fromPop);
}
/* ===== browser history (back / forward arrows) ===== */
let _histInit=false;
function route(state,fromPop){
  if(fromPop) return;
  try{
    const url="#"+(state.t==="detail"?"festival-"+state.id:state.view);
    if(!_histInit){ history.replaceState(state,"",url); _histInit=true; }
    else history.pushState(state,"",url);
  }catch(e){}
}
function goBack(){ if(_histInit) history.back(); else go("home"); }
window.addEventListener("popstate",function(e){
  if(document.getElementById("app").classList.contains("hidden")) return; // not in the app yet
  const s=e.state;
  if(s&&s.t==="detail"){ if(curDetail!==s.id) openDetail(s.id,true); }
  else go((s&&s.view)||"home",true);
});
function cycleNav(){ const cur=document.querySelector("section.view.on").id.replace("v-",""); const i=NAV.indexOf(cur); go(NAV[(i+1)%NAV.length]); }
/* mobile nav dropdown */
function toggleNavMenu(e){ if(e) e.stopPropagation(); document.getElementById("navDrop").classList.toggle("open"); }
function navPick(v){ document.getElementById("navDrop").classList.remove("open"); go(v); }
document.addEventListener("click",()=>{ const d=document.getElementById("navDrop"); if(d) d.classList.remove("open"); });

/* ================= FAQ ================= */
const FAQ=[
  { q:{ko:"평점(별점)은 어떻게 매겨지나요?",
       en:"How is the star rating decided?"},
    a:{ko:"평점은 <b>실제로 축제를 방문해 '도장'을 받은 방문자들의 별점(1~5점) 평균</b>이에요. 상세 페이지에서 방문 인증을 마치면 리뷰를 남길 수 있고, 남긴 별점이 곧바로 평균에 반영돼 소수점 첫째 자리까지 표시돼요. 아직 후기가 없는 축제는 편집팀이 정한 기준값으로 시작해, 후기가 쌓일수록 실제 평균으로 바뀝니다.",
       en:"The rating is the <b>average of the 1–5 star scores left by visitors who actually attended and earned the festival's stamp</b>. Once you verify your visit on the detail page you can post a review, and your score folds straight into the average (shown to one decimal). Festivals without reviews yet start from an editor-set baseline and shift to the real average as reviews come in."} },
  { q:{ko:"'지속가능 체감도'는 어떤 기준인가요?",
       en:"What exactly is the 'sustainability' score based on?"},
    a:{ko:"별점과 마찬가지로 <b>방문 인증을 한 사람이 \"이 축제가 얼마나 지속가능하게 느껴졌는지\"를 1~5점으로 매긴 평균</b>이에요. '점수'가 아니라 '체감도'라고 부르는 이유는, 전문가 심사가 아니라 현장을 직접 겪은 방문자의 경험을 모은 값이기 때문이에요. 다회용기 푸드존, 차 없는 거리, 조명 최소화, 비건·로컬 마켓, 플로깅 같은 실제 운영이 점수에 반영돼요. 각 축제의 <b>'지속가능 포인트'</b> 목록에서 그 근거를 직접 확인할 수 있어요.",
       en:"Like the rating, it's the <b>average 1–5 score that verified visitors give to how sustainable the festival felt</b>. We call it a 'felt' score rather than an official grade because it aggregates the experience of people who were actually there — not an expert audit. Real practices like reusable-ware food zones, car-free streets, minimal lighting, vegan/local markets and plogging feed into it, and you can see the evidence in each festival's <b>Sustainability points</b> list."} },
  { q:{ko:"♻ 초록(지속가능) 태그가 붙는 기준은?",
       en:"What makes a festival get the green ♻ tag?"},
    a:{ko:"친환경 운영 요소가 뚜렷한 축제에 붙이는 표시예요. 쓰레기·탄소를 줄이는 구체적인 실천이 확인되는 경우에 해당하고, 그 내용은 상세 페이지의 '지속가능 포인트'에 정리해 두었어요.",
       en:"It marks festivals with clear eco-focused operations — where concrete waste- or carbon-reducing practices are documented. You'll find those specifics under 'Sustainability points' on the detail page."} },
  { q:{ko:"도장은 어떻게 받나요?",
       en:"How do I earn a stamp?"},
    a:{ko:"축제마다 인증 방법이 달라요 — <b>위치 인증(GPS)</b>, <b>QR 코드</b>, <b>티켓 사진</b> 중 하나예요. 상세 페이지의 '인증하기' 버튼으로 진행하면 되고, 서로 다른 축제에서 <b>도장 5개</b>를 모으면 제주 지도가 완성돼 보상을 받아요.",
       en:"Each festival uses one of three methods — <b>location (GPS)</b>, <b>QR code</b>, or a <b>ticket photo</b>. Tap 'Verify' on the detail page to check in. Collect <b>5 stamps</b> across different festivals to complete your Jeju map and unlock rewards."} },
  { q:{ko:"점수를 조작할 수는 없나요?",
       en:"Can the scores be gamed?"},
    a:{ko:"평점과 체감도는 <b>방문 인증(도장)을 마친 방문자의 후기</b>를 바탕으로 하고, 로그인한 계정으로만 남길 수 있어요. 그래서 가본 적 없는 사람이 무분별하게 점수를 매기기 어려운 구조예요. 완벽하진 않지만, 실제 경험에 최대한 가깝게 유지하려는 방향이에요.",
       en:"Ratings and sustainability scores come from <b>reviews by visitors who've completed a check-in</b>, and can only be left from a signed-in account — so it's hard for someone who never attended to spam scores. It isn't bulletproof, but the goal is to keep the numbers as close to real experience as possible."} },
  { q:{ko:"축제 정보와 날짜는 어디서 오나요?",
       en:"Where does the festival info and dates come from?"},
    a:{ko:"편집팀이 정리한 제주 지속가능 축제 목록에, <b>한국관광공사 TourAPI</b>의 실시간 축제 데이터를 더해 보여줘요. 실시간으로 불러온 축제에는 <b>● LIVE</b> 표시가 붙어요. 정보가 바뀔 수 있으니 방문 전 공식 홈페이지도 함께 확인해 주세요.",
       en:"We combine an editor-curated list of Jeju's sustainable festivals with live festival data from the <b>Korea Tourism Organization TourAPI</b>. Live-loaded festivals carry a <b>● LIVE</b> badge. Details can change, so please double-check the official homepage before you go."} },
  { q:{ko:"홈 화면의 숫자(회원·방문 등)는 진짜인가요?",
       en:"Are the numbers on the home page real?"},
    a:{ko:"네, 실제 활동을 반영해요. 새로운 가입, 축제 방문 인증, 사이트 방문이 일어나면 그만큼 올라가요. 다만 서비스 초기라 <b>출범 기준의 기본 수치 위에 실제 데이터가 더해지는</b> 방식이라는 점은 솔직히 밝혀둘게요.",
       en:"Yes — they reflect real activity, rising as people sign up, check in at festivals, and visit the site. In full honesty, since the service is young, <b>real data is added on top of a launch baseline</b> rather than starting from zero."} },
  { q:{ko:"랭킹은 어떻게 정해지고, 언제 초기화되나요?",
       en:"How is the ranking calculated, and when does it reset?"},
    a:{ko:"랭킹은 <b>이번 달에 모은 도장 수</b>를 기준으로 하고, <b>매월 1일에 초기화</b>돼요. 실제 사용자가 우선 표시되고, 참여자가 적은 달에는 예시 사용자로 채워질 수 있어요.",
       en:"Ranking is based on <b>how many stamps you collect this month</b> and <b>resets on the 1st</b>. Real users are shown first; in quiet months the board may be topped up with sample users."} },
  { q:{ko:"개인정보와 이메일은 어떻게 쓰이나요?",
       en:"How are my email and personal data used?"},
    a:{ko:"이메일과 계정 정보는 로그인과 도장 기록에만 쓰여요. 문의·버그 리포트에 남긴 이메일은 답장용으로만 사용하고, 비밀번호는 <b>해시 처리해 저장</b>해 원문을 보관하지 않아요.",
       en:"Your email and account info are used only for sign-in and stamp records. An email left on a report is used solely to reply, and passwords are <b>stored hashed</b> — we never keep the plain text."} },
  { q:{ko:"정보가 틀렸거나 오류를 발견하면요?",
       en:"What if information is wrong or I hit a bug?"},
    a:{ko:"홈 화면 맨 아래 <b>문의·버그 리포트 카드</b>로 알려주세요. 내용을 확인하고 최대한 빨리 반영할게요.",
       en:"Please tell us through the <b>report card at the bottom of the home page</b>. We'll review it and fix things as fast as we can."} },
];
/* category per FAQ item (index-aligned with FAQ) + chip labels */
const FAQ_CAT=["score","score","score","stamp","score","data","data","stamp","data","data"];
const FAQ_CATS=[
  {k:"all",  ko:"전체",         en:"All"},
  {k:"score",ko:"점수·신뢰",     en:"Scores & trust"},
  {k:"stamp",ko:"도장·참여",     en:"Stamps & play"},
  {k:"data", ko:"데이터·개인정보",en:"Data & privacy"},
];
let faqCat="all";
function setFaqCat(k){ faqCat=k; renderFaq(); }
function renderFaq(){
  const w=document.getElementById("faqWrap"); if(!w) return;
  const chips=FAQ_CATS.map(c=>{
    const n=c.k==="all"?FAQ.length:FAQ_CAT.filter(x=>x===c.k).length;
    return `<button class="faqchip${faqCat===c.k?' on':''}" onclick="setFaqCat('${c.k}')">${tv(c)}<span>${n}</span></button>`;
  }).join("");
  const list=FAQ.map((it,idx)=>({it,idx})).filter(o=>faqCat==="all"||FAQ_CAT[o.idx]===faqCat);
  const items=list.map((o,i)=>`<details class="faqitem"${i===0?" open":""}>
      <summary>
        <span class="faq-n">${String(i+1).padStart(2,"0")}</span>
        <span class="faq-q">${tv(o.it.q)}</span>
        <span class="faq-mk" aria-hidden="true"></span>
      </summary>
      <div class="faq-a">${tv(o.it.a)}</div>
    </details>`).join("");
  w.innerHTML=`
    <header class="faqhero">
      <span class="faqhero-ey">${t("faq_eyebrow")}</span>
      <h1 class="faqhero-t">${t("faq_title")}</h1>
      <p class="faqhero-s">${t("faq_sub")}</p>
    </header>
    <div class="faqchips">${chips}</div>
    <div class="faqlist">${items}</div>
    <div class="faq-more">
      <div class="faq-more-txt"><h3>${t("faq_more")}</h3><p>${t("faq_more_sub")}</p></div>
      <button class="btn btn-dark btn-sm" onclick="faqToReport()">${t("faq_more_btn")}</button>
    </div>`;
}
function faqToReport(){ go("home"); setTimeout(()=>{ const b=document.querySelector(".bugcard"); if(b) b.scrollIntoView({behavior:"smooth",block:"center"}); },380); }

/* Google Sign-In */
async function initGoogle(){
  let cfg; try{ cfg=await api("/config"); }catch(e){ return; }
  if(!cfg.googleClientId) return;
  (function render(){
    if(!window.google||!google.accounts||!google.accounts.id){ setTimeout(render,300); return; }
    google.accounts.id.initialize({client_id:cfg.googleClientId, callback:onGoogleCredential});
    const el=document.getElementById("googleBtn"); el.innerHTML="";
    google.accounts.id.renderButton(el,{theme:"outline",size:"large",shape:"pill",text:"continue_with",width:320});
    document.getElementById("googleWrap").classList.remove("hidden");
  })();
}
async function onGoogleCredential(resp){
  hideAuthErr();
  try{
    const data=await api("/google",{method:"POST",body:JSON.stringify({credential:resp.credential})});
    token=data.token; ME=data.user; localStorage.setItem("jf_token",token); await enterApp();
  }catch(e){ showAuthErr("google_failed"); }
}

/* ================= sorting / filtering ================= */
function setSort(v){ sortMode=v; renderHome(); }
function sortList(list){ const m=sortMode; return list.slice().sort((a,b)=>{
  if(m==="rating") return b.ratingAvg-a.ratingAvg;
  if(m==="sus") return b.susAvg-a.susAvg;
  if(m==="name") return tv(a.name).localeCompare(tv(b.name),lang);
  return a.start.localeCompare(b.start); }); }
function inMonth(f){ const a=dObj(f.start),b=dObj(f.end),cur=curYear*12+curMonth; return (a.y*12+a.m)<=cur && cur<=(b.y*12+b.m); }
/* open the calendar on August (of whichever year has the most festivals) */
function pickDefaultMonth(){
  let best={c:-1,m:7,y:2026};
  [2025,2026].forEach(y=>{
    const m=7, cur=y*12+m;
    const c=FEST.filter(f=>{const a=dObj(f.start),b=dObj(f.end);return (a.y*12+a.m)<=cur&&cur<=(b.y*12+b.m);}).length;
    if(c>best.c) best={c,m,y};
  });
  curMonth=best.m; curYear=best.y;
}
function shiftMonth(d){ curMonth+=d; if(curMonth<0){curMonth=11;curYear--;} if(curMonth>11){curMonth=0;curYear++;} renderHome(); }

/* ================= HOME ================= */
function renderHome(){ buildFilters("catFilters",renderHome); renderInits(); renderPcards(); renderHomeStats(); animateHomeIn(); }
function renderHomeStats(){
  const el=document.getElementById("homeStats"); if(!el || el.dataset.loaded) return;
  el.dataset.loaded="1";
  api("/impact").then(d=>{
    const row=(cu,lab)=>`<div class="hst-line"><span>${lab}</span><b data-cu="${cu}">0</b></div>`;
    el.innerHTML=`<div class="hst">
      <div class="hst-main">
        <span class="hst-over">${t("home_stats_eyebrow")}</span>
        <div class="hst-big"><b data-cu="u">0</b><i>${t("home_stats_ppl")}</i></div>
        <p class="hst-sub">${t("home_stats_sub")}</p>
      </div>
      <div class="hst-perf" aria-hidden="true"></div>
      <div class="hst-stub">
        ${row("s",t("home_signups"))}
        ${row("v",t("home_visits"))}
        ${row("w",t("home_views"))}
        <div class="hst-foot">${t("home_stats_live")}</div>
      </div>
    </div>`;
    const runCount=()=>{
      countUp(el.querySelector('[data-cu="u"]'),d.travelers,{dur:1400});
      countUp(el.querySelector('[data-cu="s"]'),d.signups,{dur:1200});
      countUp(el.querySelector('[data-cu="v"]'),d.stamps,{dur:1300});
      countUp(el.querySelector('[data-cu="w"]'),d.views,{dur:1500});
    };
    // count up only when the ticket scrolls into view (not on render, so it isn't missed below the fold)
    const card=el.querySelector(".hst");
    if(document.hidden || !("IntersectionObserver" in window) || !card){ runCount(); return; }
    let done=false; const go=()=>{ if(done)return; done=true; runCount(); };
    const io=new IntersectionObserver((ents)=>{ ents.forEach(en=>{ if(en.isIntersecting){ go(); io.disconnect(); } }); },{threshold:0.25});
    io.observe(card);
    setTimeout(go,4000); // safety: never leave the numbers stuck at 0
  }).catch(()=>{ el.innerHTML=""; el.dataset.loaded=""; });
}
/* home entrance + scroll-reveal animations.
   Elements are visible by default; `.in` (added by the observer as they approach the viewport)
   triggers the entrance keyframe. Fling-past or observer-less cases just leave content visible. */
function animateHomeIn(){
  const home=document.getElementById("v-home"); if(!home) return;
  if(!home.dataset.entered){ home.dataset.entered="1"; const hero=home.querySelector(".hero"); if(hero) hero.classList.add("enter"); }
  // fade+rise blocks
  home.querySelectorAll(".protect .pblock, .controls, #calWrap, .inits, .bugcard").forEach(el=>el.classList.add("reveal"));
  // clip-path mask-reveal on the big headings (printed-in, not faded)
  home.querySelectorAll(".sec-head h2, .greener h2").forEach(el=>el.classList.add("maskrev"));
  // stamp "thunk" on the problem cards — scale down + settle, like a rubber stamp pressing on paper
  home.querySelectorAll("#pcards .pcard").forEach((el,i)=>{ el.classList.add("stamprev"); el.style.animationDelay=(i*70)+"ms"; });
  heroParallax(home);
  revealObserve();
}
/* gentle hero parallax: the photo drifts slower than the page for subtle depth (skipped for reduced-motion) */
function heroParallax(home){
  if(window._heroPx) return;
  if(matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const img=home.querySelector(".hero-photo>img"); if(!img) return;
  window._heroPx=true;
  let ticking=false;
  const upd=()=>{ ticking=false;
    const r=img.parentElement.getBoundingClientRect();
    const off=Math.max(-22,Math.min(22,(window.innerHeight/2-(r.top+r.height/2))*0.06));
    img.style.transform="translateY("+off.toFixed(1)+"px) scale(1.14)";
  };
  addEventListener("scroll",()=>{ if(!ticking){ ticking=true; requestAnimationFrame(upd); } },{passive:true});
  addEventListener("resize",upd,{passive:true});
  upd();
}
function revealObserve(){
  const sel="#v-home .reveal:not(.in), #v-home .maskrev:not(.in), #v-home .stamprev:not(.in)";
  const revealAll=()=>document.querySelectorAll("#v-home .reveal, #v-home .maskrev, #v-home .stamprev").forEach(e=>e.classList.add("in"));
  if(!("IntersectionObserver" in window)){ revealAll(); return; }
  if(!window._revObs){
    window._revObs=new IntersectionObserver((ents,obs)=>{
      ents.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); obs.unobserve(en.target); } });
    },{rootMargin:"0px 0px -12% 0px",threshold:0.05});
  }
  document.querySelectorAll(sel).forEach(e=>window._revObs.observe(e));
  clearTimeout(window._revSafety); window._revSafety=setTimeout(revealAll,3500); // never leave anything clipped/hidden
}
function buildFilters(elId,cb){
  const w=document.getElementById(elId); if(!w) return; w.innerHTML="";
  const mk=(key,label,cls="")=>{ const b=document.createElement("button");
    b.className="chipf "+cls+(catFilter===key?" on":""); b.textContent=label;
    b.onclick=()=>{catFilter=key;cb();}; return b; };
  w.appendChild(mk("all",t("all")));
  CATS.forEach(c=>w.appendChild(mk(c,t(c))));
  const g=document.createElement("button");
  g.className="chipf lime"+(greenOnly?" on":""); g.textContent="♻ "+t("green_only");
  g.onclick=()=>{greenOnly=!greenOnly;cb();}; w.appendChild(g);
}
function filtered(){ let l=FEST.filter(inMonth); if(catFilter!=="all") l=l.filter(f=>f.cat===catFilter); if(greenOnly) l=l.filter(f=>f.green); return sortList(l); }
function renderInits(){
  document.getElementById("monthLbl").textContent=`${MON[lang][curMonth]} ${curYear}`;
  buildSortSelects();
  renderCalendar();
  const list=filtered();
  document.getElementById("initList").innerHTML=list.length?list.map(initRow).join(""):`<div class="empty">${t("no_fest")}</div>`;
}
/* festivals active on a given calendar day (m is 0-based) */
function festsOnDay(y,m,d){
  const key=y*10000+(m+1)*100+d;
  return FEST.filter(f=>{
    const a=dObj(f.start), b=dObj(f.end);
    const ak=a.y*10000+(a.m+1)*100+a.d, bk=b.y*10000+(b.m+1)*100+b.d;
    return ak<=key && key<=bk;
  }).filter(f=>catFilter==="all"||f.cat===catFilter).filter(f=>!greenOnly||f.green);
}
function renderCalendar(){
  const wrap=document.getElementById("calWrap"); if(!wrap) return;
  const y=curYear, m=curMonth;
  const firstDow=new Date(y,m,1).getDay();       // 0=Sun
  const dim=new Date(y,m+1,0).getDate();          // days in month
  const wd=lang==="ko"?["일","월","화","수","목","금","토"]:["S","M","T","W","T","F","S"];
  const today=new Date();
  const head=wd.map((w,i)=>`<div class="cal-wd${i===0?' sun':''}${i===6?' sat':''}">${w}</div>`).join("");
  let cells="";
  for(let i=0;i<firstDow;i++) cells+=`<div class="cal-cell empty"></div>`;
  for(let d=1;d<=dim;d++){
    const fs=festsOnDay(y,m,d);
    const dow=(firstDow+d-1)%7;
    const isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
    const chips=fs.slice(0,3).map(f=>{
      const a=dObj(f.start), b=dObj(f.end);
      const isStart=a.y===y&&a.m===m&&a.d===d;
      const isEnd=b.y===y&&b.m===m&&b.d===d;
      const got=has(f.id);
      return `<button class="cal-ev${got?' got':''}${isStart?' start':''}${isEnd?' end':''}" style="--c:${CATCOLOR[f.cat]}" title="${esc(tv(f.name))} · ${esc(fmtRange(f))}" onclick="event.stopPropagation();openDetail(${f.id})">${isStart?esc(tv(f.name)):"&nbsp;"}</button>`;
    }).join("");
    const more=fs.length>3?`<span class="cal-more">+${fs.length-3}</span>`:"";
    const tap=fs.length?` onclick="openCalDay(${y},${m},${d})"`:"";
    const dot=fs.length?`<span class="cal-dot" aria-hidden="true">${fs.length}</span>`:"";
    cells+=`<div class="cal-cell${fs.length?' has':''}${isToday?' today':''}${dow===0?' sun':''}${dow===6?' sat':''}"${tap}>`+
      `<span class="cal-d">${d}</span>${dot}${chips}${more}</div>`;
  }
  wrap.innerHTML=`<div class="cal-head">${head}</div><div class="cal-grid">${cells}</div>`+
    `<div class="cal-hint">${svg("i-arrow-ur","icon sm")}<span>${t("cal_hint")}</span></div>`;
}
/* tap a calendar day -> bottom sheet listing that day's festivals */
function openCalDay(y,m,d){
  const fs=festsOnDay(y,m,d);
  if(!fs.length) return;
  const wdArr=lang==="ko"?["일","월","화","수","목","금","토"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const wd=wdArr[new Date(y,m,d).getDay()];
  const dateLabel=lang==="ko"?`${m+1}월 ${d}일 (${wd})`:`${MON.en[m]} ${d}, ${y} · ${wd}`;
  const rows=fs.map(f=>`<button class="cday-ev" onclick="closeCalDay();openDetail(${f.id})">
      <span class="cday-thumb"><img src="${festImg(f)}" alt="" onerror="this.style.visibility='hidden'"></span>
      <span class="cday-main"><span class="cday-name">${esc(tv(f.name))}</span>
        <span class="cday-meta"><span class="tagpill ${f.cat}">${t(f.cat)}</span><span class="cday-date">${esc(fmtRange(f))}</span>${f.green?`<span class="tagpill lime">♻</span>`:""}</span></span>
      <span class="cday-go">${svg("i-arrow-ur","icon sm")}</span>
    </button>`).join("");
  document.getElementById("calDayCard").innerHTML=`<div class="sheet-grab"></div>
    <div class="sheet-head"><div class="mi">${svg("i-clock")}</div>
      <div><h3>${dateLabel}</h3><p>${tv({ko:`${fs.length}개의 축제가 열려요`,en:`${fs.length} festival${fs.length===1?"":"s"} on`})}</p></div></div>
    <div class="cday-list">${rows}</div>
    <div class="sheet-actions"><button class="btn btn-ghost" onclick="closeCalDay()">${t("close")}</button></div>`;
  document.getElementById("calDaySheet").classList.add("show");
}
function closeCalDay(){ document.getElementById("calDaySheet").classList.remove("show"); }
function initRow(f){
  return `<div class="init-row ${has(f.id)?'done':''}" onclick="openDetail(${f.id})">
    <div class="tt">${tv(f.name)}<small>${tv(f.loc)}</small></div>
    <div class="init-tags"><span class="tagpill ${f.cat}">${t(f.cat)}</span>${f.green?`<span class="tagpill lime">♻ ${t("green_badge")}</span>`:""}${liveBadge(f)}</div>
    <div class="init-date">${fmtRange(f)}</div>
    <div class="go">${svg(has(f.id)?"i-check":"i-arrow-ur")}</div>
  </div>`;
}
function renderPcards(){
  const feat=FEST.slice().sort((a,b)=>b.ratingAvg-a.ratingAvg).slice(0,4);
  document.getElementById("pcards").innerHTML=feat.map(pcard).join("");
}
function pcard(f){
  return `<div class="pcard" onclick="openDetail(${f.id})" style="background:${CATCOLOR[f.cat]}">
    <img src="${festImg(f)}" alt="" onerror="this.style.display='none'">
    ${has(f.id)?`<div class="stampwon">${f.stamp}</div>`:`<button class="iconbtn arw" onclick="event.stopPropagation();openDetail(${f.id})">${svg("i-arrow-ur")}</button>`}
    <div class="toptags"><span class="tagpill ${f.cat}">${t(f.cat)}</span>${f.green?`<span class="tagpill lime">♻ ${t("green_badge")}</span>`:""}${liveBadge(f)}</div>
    <h4>${tv(f.name)}</h4>
    <div class="explore"><span>${t("explore")}</span><span class="go">${svg("i-arrow")}</span></div>
  </div>`;
}

/* ================= MAP ================= */
function tipHTML(f){
  const got=has(f.id);
  return `<div class="tipcard">
    <div class="tiptitle"><span class="tdot" style="background:${got?'var(--lime-d)':CATCOLOR[f.cat]}"></span><b>${esc(tv(f.name))}</b></div>
    <div class="tchips">
      <span class="tagpill ${f.cat}">${t(f.cat)}</span>
      ${f.green?`<span class="tagpill lime">♻ ${t("green_badge")}</span>`:""}
      ${liveBadge(f)}
      ${got?`<span class="tagpill lime">✓ ${t("tip_done")}</span>`:""}
    </div>
    <div class="tline">${svg("i-clock","tipi")}<span>${fmtRange(f)}</span></div>
    <div class="tline">${svg("i-pin","tipi")}<span>${esc(tv(f.loc))}</span></div>
    <div class="tfoot">
      <span class="trate">★ ${f.ratingAvg.toFixed(1)}</span>
      <span class="tmethod">${svg(methodIcon(f.method),"tipi")}${t("method_"+f.method)}</span>
    </div>
  </div>`;
}
function setMapTiles(){
  if(mapTileLang===lang && mapTiles) return;      // already correct
  if(mapTiles){ map.removeLayer(mapTiles); mapTiles=null; }
  const mapEl=document.getElementById("map");
  if(lang==="ko"){
    // OpenStreetMap standard tiles render local-language (Korean) place names
    mapTiles=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
      maxZoom:19, attribution:'&copy; OpenStreetMap'});
    mapEl.classList.add("ko-map");
  }else{
    mapTiles=L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{
      subdomains:"abcd", maxZoom:19, attribution:'&copy; OpenStreetMap &copy; CARTO'});
    mapEl.classList.remove("ko-map");
  }
  mapTiles.addTo(map); mapTileLang=lang;
}
function renderMap(){
  if(!map){
    map=L.map("map",{scrollWheelZoom:true,zoomControl:true,zoomSnap:.5,wheelPxPerZoomLevel:80,doubleClickZoom:true}).setView([33.38,126.55],10);
  }
  setMapTiles();
  markers.forEach(m=>map.removeLayer(m)); markers=[];
  FEST.forEach(f=>{
    const got=has(f.id);
    const html=`<div class="mkpin ${got?'got':''}" style="--pin:${CATCOLOR[f.cat]}">
        <span class="mkglyph">${f.stamp}</span>${got?'<i class="mkcheck">✓</i>':''}</div>`;
    const icon=L.divIcon({html,className:"mkwrap",iconSize:[46,54],iconAnchor:[23,52],popupAnchor:[0,-50]});
    const mk=L.marker([f.lat,f.lng],{icon,riseOnHover:true}).addTo(map);
    mk.bindTooltip(tipHTML(f),{direction:"top",offset:[0,-46],className:"festtip",opacity:1});
    mk.on("click",()=>openDetail(f.id));
    markers.push(mk);
  });
  setTimeout(()=>map.invalidateSize(),120);
  renderSlots("mapSlots",false);
  const done=stamps().length, pct=Math.min(100,Math.round(done/5*100));
  document.getElementById("mapProg").style.width=pct+"%";
  const mc=document.getElementById("mapCount"); if(mc) mc.textContent=Math.min(5,done);
  const mp=document.getElementById("mapPct"); if(mp) mp.textContent=tv({ko:`제주 지도 ${pct}% 완성`,en:`Jeju map ${pct}% complete`});
  // legend overlay
  const leg=document.getElementById("mapLegend");
  if(leg) leg.innerHTML=CATS.map(c=>`<span class="lg"><i style="background:${CATCOLOR[c]}"></i>${t(c)}</span>`).join("")
    +`<span class="lg"><i class="lg-got"></i>${t("visited")}</span>`;
  // side list
  const visited=FEST.filter(f=>has(f.id)).length;
  const lc=document.getElementById("mapListCount"); if(lc) lc.textContent=tv({ko:`${FEST.length}곳 · 방문 ${visited}`,en:`${FEST.length} · ${visited} visited`});
  document.getElementById("mapList").innerHTML=FEST.map(f=>{
    const got=has(f.id);
    return `<div class="mlrow ${got?'got':''}" onclick="focusFestival(${f.id})" style="--c:${CATCOLOR[f.cat]}">
      <div class="mdot" style="background:${got?'var(--ink)':CATCOLOR[f.cat]}">${got?f.stamp:svg("i-pin")}</div>
      <div class="mn">${tv(f.name)}<small>${tv(f.loc)}</small></div>
      ${got?`<span class="ml-chip">${svg("i-check","icon sm")}</span>`:`<div class="mgo">${svg("i-arrow-ur")}</div>`}
    </div>`;}).join("");
}
function focusFestival(id){
  const f=FEST.find(x=>x.id===id); if(!map||!f) return;
  map.flyTo([f.lat,f.lng],12,{duration:.6});
  const mk=markers[FEST.indexOf(f)]; if(mk) setTimeout(()=>mk.openPopup(),450);
}
function renderSlots(elId,dark){
  const el=document.getElementById(elId); const got=stamps().slice(0,5); let h="";
  for(let i=0;i<5;i++){ const fid=got[i]; const f=fid?FEST.find(x=>x.id===fid):null;
    h+=`<div class="slot ${f?'filled':''}"><span class="snum">${i+1}</span>
      <span class="simg">${f?f.stamp:`<svg class="icon lk" viewBox="0 0 24 24" style="width:20px;height:20px"><use href="#i-medal"/></svg>`}</span></div>`; }
  el.innerHTML=h;
}

/* ================= SEARCH ================= */
function renderSearch(){
  buildFilters("searchFilters",renderSearch);
  sortMode=document.getElementById("searchSort").value||sortMode;
  const q=(document.getElementById("searchInput").value||"").toLowerCase().trim();
  const clr=document.getElementById("searchClear"); if(clr) clr.hidden=!q;
  let list=FEST.slice();
  if(catFilter!=="all") list=list.filter(f=>f.cat===catFilter);
  if(greenOnly) list=list.filter(f=>f.green);
  if(q) list=list.filter(f=>[tv(f.name),tv(f.loc),f.name.ko,f.name.en,f.loc.ko,f.loc.en,t(f.cat),tv(f.desc)].join(" ").toLowerCase().includes(q));
  list=sortList(list);
  const cnt=document.getElementById("searchCount");
  if(cnt) cnt.textContent=(q||catFilter!=="all"||greenOnly)?tv({ko:`${list.length}개의 축제`,en:`${list.length} festival${list.length===1?"":"s"}`}):"";
  document.getElementById("searchList").innerHTML=list.length?list.map(pcard).join(""):`<div class="empty" style="grid-column:1/-1">${t("no_result")}</div>`;
}
function clearSearch(){ const i=document.getElementById("searchInput"); if(i){ i.value=""; i.focus(); } renderSearch(); }

/* ================= DETAIL ================= */
/* score meter card — shows value out of a fixed max (5) with a proportional fill */
function meterCard(cls,icon,val,label,max){
  max=max||5; val=+val||0;
  const pct=Math.max(3,Math.min(100,(val/max)*100));
  return `<div class="metric ${cls}">
    <div class="m-top"><span class="m-ic">${icon}</span><span class="m-val">${val.toFixed(1)}<i>/ ${max}</i></span></div>
    <div class="m-bar"><span style="width:${pct.toFixed(1)}%"></span></div>
    <div class="lab">${label}</div>
  </div>`;
}
let curDetail=null, rvRating=5, rvSus=5;
async function openDetail(id,fromPop){
  curDetail=id; rvRating=5; rvSus=5;
  const f=FEST.find(x=>x.id===id);
  let reviews=[];
  try{ const d=await api("/festivals/"+id); reviews=d.reviews; Object.assign(f,d.festival); }catch(e){}
  const done=has(id);
  document.getElementById("detailBody").innerHTML=`
    <div class="detail-top">
      <div class="dhero">
        <img src="${festImg(f)}" alt="" onerror="this.style.display='none'">
        <div class="dt-top"><span class="tagpill ${f.cat}">${t(f.cat)}</span>${f.green?`<span class="tagpill lime">♻ ${t("green_badge")}</span>`:""}${liveBadge(f)}</div>
        <div>
          <h2>${tv(f.name)}</h2>
          <div class="dmeta">
            <div>${svg("i-clock")}<span>${fmtRange(f)}</span></div>
            <div>${svg("i-pin")}<span>${tv(f.loc)}</span></div>
            <div>${svg(methodIcon(f.method))}<span>${t("verify_method")} · ${t("method_"+f.method)}</span></div>
          </div>
        </div>
      </div>
      <div class="dside">
        <div class="metrics">
          ${meterCard("m-star","★",f.ratingAvg,t("rating"))}
          ${meterCard("m-green","♻",f.susAvg,t("sustainability"))}
        </div>
        <button class="scorehelp" onclick="go('faq')"><span class="sh-q">?</span><span>${t("detail_how_scored")}</span></button>
        ${f.info&&Object.keys(f.info).length?`<div class="dcard">
          <div class="infohd">${svg("i-flag")}${t("event_info")}</div>
          <div class="infolist">${Object.entries(f.info).map(([k,v])=>`<div class="inforow"><span class="ik">${esc(k)}</span><span class="iv">${nl2br(v)}</span></div>`).join("")}</div>
        </div>`:""}
        ${tv(f.sus).length?`<div class="dcard">
          <div class="infohd">${svg("i-leaf")}${t("sus_points")}</div>
          <div class="susbox"><ul>${tv(f.sus).map(s=>`<li>${s}</li>`).join("")}</ul></div>
        </div>`:""}
        <a class="weblink" href="${esc(festLink(f).url)}" target="_blank" rel="noopener noreferrer">${svg("i-arrow-ur","icon sm")}${festLink(f).label}</a>
      </div>
    </div>
    <div class="dcard ddesc">
      <div class="infohd">${svg("i-clock")}${t("about_festival")}</div>
      <p>${nl2br(tv(f.desc))||"—"}</p>
    </div>
    <div class="sectlabel">${svg("i-star")}${t("reviews")} (${reviews.length})</div>
    <div id="reviewList">${reviews.map(reviewHTML).join("")||`<div class="empty" style="padding:24px">—</div>`}</div>
    ${done?reviewFormHTML():""}
    <div class="bigverify">
      <button class="btn ${done?'btn-dark':'btn-lime'}" ${done?'disabled':''} onclick="openCheckin(${id})">
        ${svg(done?"i-check":methodIcon(f.method))}${done?t("verify_done"):t("verify_do")}
      </button>
    </div>`;
  document.querySelectorAll("section.view").forEach(s=>s.classList.remove("on"));
  document.getElementById("v-detail").classList.add("on");
  document.querySelectorAll(".navlinks button").forEach(b=>b.classList.remove("on"));
  window.scrollTo({top:0,behavior:"smooth"});
  route({t:"detail",id},fromPop);
}
function reviewHTML(r){
  const colors=["#DEF24E","#2F9E62","#2E86C7","#F2B01E","#B26A2E"]; const nm=r.name||"";
  const c=colors[(nm.charCodeAt(0)||0)%colors.length];
  return `<div class="review"><div class="rh">
    <div class="avatar sm" style="background:${c}">${r.avatar||nm[0]||"🙂"}</div>
    <span class="rn">${esc(nm)}</span><span class="rr">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span></div>
    <p>${esc(tv(r.text))||"—"}</p></div>`;
}
function reviewFormHTML(){
  return `<div class="dcard rvform">
    <div class="fld">${t("write_review")}</div>
    <div class="fld" style="margin-top:10px">${t("rv_rating")}</div>
    <div class="starpick" id="rvStars">${[1,2,3,4,5].map(n=>`<button type="button" onclick="setRv('r',${n})" class="${n<=rvRating?'on':''}">★</button>`).join("")}</div>
    <div class="fld">${t("rv_sus")}</div>
    <div class="starpick" id="rvSusStars">${[1,2,3,4,5].map(n=>`<button type="button" onclick="setRv('s',${n})" class="${n<=rvSus?'on':''}">♻</button>`).join("")}</div>
    <textarea id="rvText" placeholder="${t("rv_placeholder")}" maxlength="400"></textarea>
    <button class="btn btn-dark" style="margin-top:12px;width:100%" onclick="submitReview()">${svg("i-star")}${t("rv_submit")}</button>
  </div>`;
}
function setRv(w,n){ if(w==="r"){rvRating=n;document.querySelectorAll("#rvStars button").forEach((b,i)=>b.classList.toggle("on",i<n));}
  else{rvSus=n;document.querySelectorAll("#rvSusStars button").forEach((b,i)=>b.classList.toggle("on",i<n));} }
async function submitReview(){
  const text=document.getElementById("rvText").value;
  try{ await api("/festivals/"+curDetail+"/review",{method:"POST",body:JSON.stringify({rating:rvRating,sustainability:rvSus,text})});
    toast(t("rv_thanks")); openDetail(curDetail); }catch(e){ toast(t("err_network")); }
}

/* ================= CHECK-IN SHEET ================= */
let ticketReady=false, geoCoords=null;
function openCheckin(id){
  if(has(id)) return;
  const f=FEST.find(x=>x.id===id); const m=f.method;
  ticketReady=false; geoCoords=null;
  const head=`<div class="sheet-grab"></div>
    <div class="sheet-head"><div class="mi">${svg(methodIcon(m))}</div>
      <div><h3>${t("ci_"+m+"_title")}</h3><p>${tv(f.name)} · ${t("ci_"+m+"_sub")}</p></div></div>`;
  let body="";
  if(m==="qr") body=qrUI(f);
  else if(m==="geo") body=geoUI(f);
  else body=ticketUI(f);
  document.getElementById("sheetCard").innerHTML=head+body;
  document.getElementById("checkinSheet").classList.add("show");
  if(m==="qr") startQR(id);
  if(m==="ticket") wireTicket(id);
}
function closeCheckin(){ stopQR(); document.getElementById("checkinSheet").classList.remove("show"); }
function setSheetErr(msg){ const e=document.getElementById("sheetErr"); if(e) e.textContent=msg||""; }

/* ---- QR ---- */
let qrStream=null, qrRAF=null;
function qrUI(f){
  return `<div class="scanbox"><video id="qrVideo" playsinline muted></video>
      <div class="reticle"></div><div class="scanline"></div>
      <div class="ph" id="qrCamNote">${t("cam_starting")}</div></div>
    <div class="smallnote">${t("qr_or")}</div>
    <div class="codeinput">
      <input id="qrCode" placeholder="JEJU-${f.id}" maxlength="10" oninput="setSheetErr('')">
      <button class="btn btn-dark btn-sm" onclick="submitQR(${f.id})">${t("confirm")}</button>
    </div>
    <div class="sheet-err" id="sheetErr"></div>
    <div class="sheet-actions"><button class="btn btn-ghost" onclick="closeCheckin()">${t("cancel")}</button></div>
    <div class="smallnote">${t("qr_demo_hint").replace("{code}","JEJU-"+f.id)}</div>`;
}
async function startQR(id){
  const video=document.getElementById("qrVideo"); const note=document.getElementById("qrCamNote");
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ note.textContent=t("cam_denied"); return; }
  try{
    qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
    video.srcObject=qrStream; await video.play(); note.style.display="none";
    if("BarcodeDetector" in window){
      const det=new BarcodeDetector({formats:["qr_code"]});
      const tick=async()=>{ if(!qrStream) return;
        try{ const codes=await det.detect(video); if(codes.length){ document.getElementById("qrCode").value=codes[0].rawValue; submitQR(id); return; } }catch(e){}
        qrRAF=requestAnimationFrame(tick); };
      tick();
    }
  }catch(e){ note.style.display="block"; note.textContent=t("cam_denied"); }
}
function stopQR(){ if(qrRAF){cancelAnimationFrame(qrRAF);qrRAF=null;} if(qrStream){qrStream.getTracks().forEach(t=>t.stop());qrStream=null;} }
function submitQR(id){
  const code=(document.getElementById("qrCode").value||"").trim();
  if(!code){ setSheetErr(t("err_bad_qr")); return; }
  doCheckin(id,{code});
}

/* ---- GEO ---- */
function geoUI(f){
  return `<div class="geobox">
      <div class="geoviz">${svg("i-target")}</div>
      <div class="geostat" id="geoStat">${t("geo_intro")}</div>
    </div>
    <div class="sheet-err" id="sheetErr"></div>
    <div class="sheet-actions" id="geoActions">
      <button class="btn btn-dark" style="width:100%" onclick="startGeo(${f.id})">${svg("i-target")}${t("geo_locate")}</button>
    </div>
    <div class="smallnote"><button style="text-decoration:underline;color:var(--muted)" onclick="doCheckin(${f.id},{demo:true})">${t("geo_demo")}</button></div>`;
}
function startGeo(id){
  const f=FEST.find(x=>x.id===id); const stat=document.getElementById("geoStat"); setSheetErr("");
  if(!navigator.geolocation){ stat.textContent=t("geo_denied"); return; }
  stat.textContent=t("geo_locating");
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude,longitude}=pos.coords; geoCoords={lat:latitude,lng:longitude};
    const d=haversineKm(latitude,longitude,f.lat,f.lng);
    if(d<=25){ stat.textContent=t("geo_here").replace("{d}",d.toFixed(1));
      document.getElementById("geoActions").innerHTML=`<button class="btn btn-lime" style="width:100%" onclick="doCheckin(${id},{lat:${latitude},lng:${longitude}})">${svg("i-check")}${t("geo_confirm")}</button>`;
    } else { stat.textContent=t("geo_far").replace("{d}",d.toFixed(0)); }
  }, err=>{ stat.textContent=t("geo_denied"); }, {enableHighAccuracy:true,timeout:10000,maximumAge:0});
}

/* ---- TICKET ---- */
function ticketUI(f){
  return `<div class="ticketbox">
      <label class="ticketdrop" id="ticketDrop">
        ${svg("i-upload")}<p><b>${t("ticket_drop")}</b></p><p>${t("ticket_hint")}</p>
        <input type="file" accept="image/*" capture="environment" id="ticketInput" style="display:none">
      </label>
      <div class="ticketpreview" id="ticketPreview" style="display:none"><img id="ticketImg" alt=""><button class="redo" onclick="resetTicket()">${t("ticket_redo")}</button></div>
    </div>
    <div class="sheet-err" id="sheetErr"></div>
    <div class="sheet-actions">
      <button class="btn btn-lime" id="ticketConfirm" style="width:100%;opacity:.5;pointer-events:none" onclick="doCheckin(${f.id},{hasPhoto:true})">${svg("i-check")}${t("ticket_confirm")}</button>
    </div>
    <div class="sheet-actions" style="margin-top:8px"><button class="btn btn-ghost" style="width:100%" onclick="closeCheckin()">${t("cancel")}</button></div>`;
}
function wireTicket(id){
  const input=document.getElementById("ticketInput");
  input.addEventListener("change",e=>{
    const file=e.target.files[0]; if(!file) return;
    const url=URL.createObjectURL(file);
    document.getElementById("ticketImg").src=url;
    document.getElementById("ticketDrop").style.display="none";
    document.getElementById("ticketPreview").style.display="block";
    ticketReady=true;
    const c=document.getElementById("ticketConfirm"); c.style.opacity="1"; c.style.pointerEvents="auto";
    setSheetErr("");
  });
}
function resetTicket(){
  ticketReady=false;
  document.getElementById("ticketDrop").style.display="block";
  document.getElementById("ticketPreview").style.display="none";
  const c=document.getElementById("ticketConfirm"); c.style.opacity=".5"; c.style.pointerEvents="none";
}

/* ---- submit check-in ---- */
async function doCheckin(id,proof){
  try{
    const d=await api("/festivals/"+id+"/checkin",{method:"POST",body:JSON.stringify(proof||{})});
    ME.stamps=d.stamps; closeCheckin(); onStampEarned(id,d.method);
  }catch(err){
    if(err.reason==="bad_qr") setSheetErr(t("err_bad_qr"));
    else if(err.reason==="too_far") setSheetErr(t("err_too_far").replace("{d}",err.distanceKm||"?"));
    else if(err.reason==="no_photo") setSheetErr(t("err_no_photo"));
    else if(err.status===401){ toast(t("err_network")); }
    else setSheetErr(t("err_checkin"));
  }
}
function onStampEarned(id,method){
  const f=FEST.find(x=>x.id===id);
  document.getElementById("msStamp").textContent=f.stamp;
  document.getElementById("msMethod").textContent=t("method_"+(method||f.method));
  document.getElementById("msTitle").textContent=t("ms_title");
  document.getElementById("msDesc").textContent=tv(f.name);
  document.getElementById("stampModal").classList.add("show");
  confetti(); updateHeader(); checkRewards();
  if(curDetail===id) openDetail(id);
}
function checkRewards(){
  const key="jf_rewards_"+(ME&&ME.id); const seen=JSON.parse(localStorage.getItem(key)||"[]");
  [1,3,5].forEach(k=>{ if(stamps().length>=k && !seen.includes(k)){ seen.push(k); setTimeout(()=>toast("🎁 "+t("reward_toast")),900); } });
  localStorage.setItem(key,JSON.stringify(seen));
}

/* ================= MY ================= */
/* animated count-up for a number element (with a safety fallback if rAF is throttled) */
function countUp(el,to,opts){
  if(!el) return; to=+to||0; const dur=(opts&&opts.dur)||1100, suffix=(opts&&opts.suffix)||"";
  const fmt=v=>Math.round(v).toLocaleString("ko-KR")+suffix;
  if(document.hidden){ el.textContent=fmt(to); return; } // tab not visible → skip animation, show final now
  let t0=null;
  const tick=(t)=>{ if(t0==null)t0=t; const p=Math.min(1,(t-t0)/dur); el.textContent=fmt(to*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  setTimeout(()=>{ el.textContent=fmt(to); }, dur+120); // guarantee final value
}
/* retro odometer / split-flap ticker: renders a number as dark digit tiles that spin up */
function renderTicker(el,num){
  const s=Math.round(num).toLocaleString("ko-KR");
  el.innerHTML=[...s].map(ch=>ch===","?`<span class="tk-sep">,</span>`:`<span class="tk-d">${ch}</span>`).join("");
}
function countUpTicker(el,to,opts){
  if(!el) return; to=+to||0; const dur=(opts&&opts.dur)||1500;
  if(document.hidden){ renderTicker(el,to); return; }   // hidden tab → show final, no animation
  let t0=null;
  const tick=(t)=>{ if(t0==null)t0=t; const p=Math.min(1,(t-t0)/dur); renderTicker(el,to*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  setTimeout(()=>renderTicker(el,to),dur+150);          // guarantee final value
}
function renderMy(){
  const n=stamps().length;
  const lvl=t(n>=5?"lvl5":n>=3?"lvl3":n>=1?"lvl1":"lvl0");
  const pct=Math.round(Math.min(100,n/5*100));
  const C=326.73, off=C*(1-Math.min(1,n/5));
  const rewards=[{k:1,icon:"🏅",tt:"r1_t",dd:"r1_d"},{k:3,icon:"🎟️",tt:"r3_t",dd:"r3_d"},{k:5,icon:"🎁",tt:"r5_t",dd:"r5_d"}];
  document.getElementById("myBody").innerHTML=`
    <div class="my-hero">
      <div class="mh-id">
        <div class="mh-av">${ME.avatar||"🧑‍🌾"}</div>
        <div>
          <div class="mh-name">${esc(ME.name||t("me"))}</div>
          <div class="mh-lvl">${svg("i-leaf")}${lvl}</div>
          <div class="mh-prog"><i style="width:${pct}%"></i></div>
          <div class="mh-progtxt">${t("st_progress")} ${pct}%</div>
        </div>
      </div>
      <div class="ringwrap">
        <svg class="ring" viewBox="0 0 120 120">
          <defs><linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E0F10"/><stop offset="1" stop-color="#2F6B1E"/></linearGradient></defs>
          <circle class="ring-bg" cx="60" cy="60" r="52"/>
          <circle class="ring-fg" cx="60" cy="60" r="52" style="stroke:url(#ringgrad);stroke-dasharray:${C};stroke-dashoffset:${off}"/>
        </svg>
        <div class="ring-txt"><b>${n}<i>/5</i></b><span>${t("my_goal")}</span></div>
      </div>
    </div>
    <div class="sectlabel">${svg("i-medal")}${t("my_stamps")}</div>
    <div class="slots light" id="mySlots"></div>
    <div class="sectlabel">${svg("i-gift")}${t("my_rewards")}</div>
    <div class="rewards2">${rewards.map(r=>{
      const ok=n>=r.k, cur=Math.min(n,r.k), w=Math.round(cur/r.k*100);
      return `<div class="rcard ${ok?'on':''}">
        <div class="ric">${r.icon}</div>
        <div class="rtt">${t(r.tt)}</div>
        <div class="rdd">${t(r.dd)}</div>
        <div class="rbar"><i style="width:${w}%"></i></div>
        <div class="rstat2">${ok?svg("i-check","icon sm")+t("unlocked"):cur+" / "+r.k}</div>
      </div>`; }).join("")}</div>
    <button class="logoutbtn" onclick="logout()">${svg("i-logout","icon sm")} ${t("logout")}</button>`;
  renderSlots("mySlots",false);
}

/* ================= RANK ================= */
async function renderRank(){
  let board=[], season="";
  try{ const d=await api("/leaderboard"); board=d.leaderboard; season=d.season||""; }catch(e){}
  const sub=document.querySelector("#v-rank .sec-head p");
  if(sub) sub.textContent=(season?season+" · ":"")+t("rank_sub");
  if(!board.some(b=>b.userId===ME.id)) board.push({name:ME.name,avatar:ME.avatar,count:stamps().length,userId:ME.id});
  board.sort((a,b)=>b.count-a.count);
  const max=Math.max(1,...board.map(b=>b.count));
  const top=board.slice(0,3), rest=board.slice(3);
  const medals=["🥇","🥈","🥉"], podCls=["pod1","pod2","pod3"];
  const podium=top.length?`<div class="podium">${top.map((p,i)=>{ const me=p.userId===ME.id;
    return `<div class="pod ${podCls[i]} ${me?'me':''}">
      <div class="pod-rank">${i+1}</div>
      <div class="pod-medal">${medals[i]}</div>
      <div class="pod-av">${p.avatar||"🙂"}</div>
      <div class="pod-name">${esc(p.name)}${me?" · "+t("me"):""}</div>
      <div class="pod-count"><b>${p.count}</b>${svg("i-medal")}</div>
    </div>`; }).join("")}</div>`:"";
  const list=rest.length?`<div class="ranklist">${rest.map((p,i)=>{ const me=p.userId===ME.id, w=Math.round(p.count/max*100);
    return `<div class="rrow ${me?'me':''}">
      <span class="rr-k">${i+4}</span>
      <div class="rr-av">${p.avatar||"🙂"}</div>
      <div class="rr-main"><div class="rr-name">${esc(p.name)}${me?`<span class="metag">${t("me")}</span>`:""}</div>
        <div class="rr-bar"><i style="width:${w}%"></i></div></div>
      <span class="rr-count"><b>${p.count}</b>${svg("i-medal")}</span>
    </div>`; }).join("")}</div>`:"";
  document.getElementById("rankList").innerHTML=podium+list;
  startRankCountdown();
}
/* live monthly season countdown (D-day + live clock + month-progress bar) */
let rankCdTimer=null;
function stopRankCountdown(){ if(rankCdTimer){ clearInterval(rankCdTimer); rankCdTimer=null; } }
function startRankCountdown(){
  const el=document.getElementById("rankCd"); if(!el) return;
  el.hidden=false;
  const p2=v=>String(v).padStart(2,"0");
  function tick(){
    if(!document.getElementById("rankCd")){ stopRankCountdown(); return; }
    const now=new Date();
    const mStart=new Date(now.getFullYear(),now.getMonth(),1,0,0,0,0);
    const mEnd=new Date(now.getFullYear(),now.getMonth()+1,1,0,0,0,0);
    const sec=Math.max(0,Math.floor((mEnd-now)/1000));
    const dday=Math.floor(sec/86400), h=Math.floor((sec%86400)/3600), m=Math.floor((sec%3600)/60), s=sec%60;
    const pct=Math.min(100,Math.max(0,Math.round((now-mStart)/(mEnd-mStart)*100)));
    const status = dday<=0 ? {c:"last",txt:t("cd_last")} : dday<3 ? {c:"soon",txt:t("cd_soon")} : {c:"live",txt:t("cd_ontrack")};
    el.className="rankcd "+status.c;
    el.innerHTML=`
      <div class="cd-inner">
        <div class="cd-dday"><span class="cd-dpre">D-</span><span class="cd-dnum">${dday}</span></div>
        <div class="cd-mid">
          <div class="cd-top"><span class="cd-lab">${svg("i-clock","icon sm")}<span>${t("cd_ends")}</span></span><span class="cd-pill">${status.txt}</span></div>
          <div class="cd-clock"><b>${p2(h)}</b><i>:</i><b>${p2(m)}</b><i>:</i><b class="cd-sec">${p2(s)}</b></div>
        </div>
      </div>
      <div class="cd-bar"><i style="width:${pct}%"></i></div>
      <div class="cd-foot"><span>${MON[lang][now.getMonth()]} ${t("rank_title")}</span><span>${pct}% ${t("cd_elapsed")}</span></div>`;
  }
  stopRankCountdown(); tick(); rankCdTimer=setInterval(tick,1000);
}

/* ================= misc ================= */
async function submitReport(e,form){
  e.preventDefault();
  const message=(form.querySelector('[name="message"]').value||"").trim();
  const email=(form.querySelector('[name="email"]').value||"").trim();
  if(message.length<3){ toast(t("report_empty")); return false; }
  const btn=form.querySelector('button'); if(btn) btn.disabled=true;
  try{
    await api("/report",{method:"POST",body:JSON.stringify({message,email})});
    form.reset(); toast(t("report_sent"));
  }catch(err){
    toast(err&&err.error==="invalid_email"?t("sub_invalid"):t("sub_failed"));
  }finally{ if(btn) btn.disabled=false; }
  return false;
}
function updateHeader(){ document.getElementById("hdrPts").textContent=stamps().length; }
let toastTimer;
function toast(msg){ const el=document.getElementById("toast"); el.textContent=msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600); }
function confetti(){
  const colors=["#DEF24E","#2F9E62","#2E86C7","#F2B01E","#E4572E","#0E0F10"];
  for(let i=0;i<30;i++){ const c=document.createElement("div"); c.className="confetti";
    c.style.left=Math.random()*100+"vw"; c.style.background=colors[i%colors.length];
    document.body.appendChild(c);
    const dx=(Math.random()-.5)*220, fall=window.innerHeight+40, dur=900+Math.random()*800;
    c.animate([{transform:`translateY(0) rotate(0)`,opacity:1},{transform:`translate(${dx}px,${fall}px) rotate(${Math.random()*720}deg)`,opacity:.9}],
      {duration:dur,easing:"cubic-bezier(.3,.6,.4,1)"}).onfinish=()=>c.remove(); }
}

/* ================= INTRO ================= */
let introObserver=null, introScrollFn=null;
function showIntro(){
  const intro=document.getElementById("intro");
  intro.classList.remove("hidden");
  intro.style.opacity=""; intro.style.transform="";
  document.body.classList.add("introlock");
  const sc=document.getElementById("introScroll"); if(sc) sc.scrollTop=0;
  const panels=[...document.querySelectorAll(".ipanel")];
  document.getElementById("introDots").innerHTML=panels.map((_,i)=>`<button aria-label="${i+1}" onclick="introGo(${i})"></button>`).join("");
  panels.forEach((p,i)=>p.classList.toggle("in",i===0));
  markDot(0);
  const bar=document.querySelector(".intro-progress i"); if(bar) bar.style.width="0%";
  if(introObserver) introObserver.disconnect();
  introObserver=new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); markDot(+e.target.dataset.i); } });
  },{root:sc,threshold:.55});
  panels.forEach(p=>introObserver.observe(p));
  // scroll progress bar + subtle content parallax
  if(introScrollFn) sc.removeEventListener("scroll",introScrollFn);
  introScrollFn=()=>{
    const max=sc.scrollHeight-sc.clientHeight;
    if(bar) bar.style.width=(max?sc.scrollTop/max*100:0)+"%";
    panels.forEach(p=>{ const off=(p.offsetTop-sc.scrollTop); const w=p.querySelector(".iwrap");
      if(w) w.style.transform=`translateY(${Math.max(-40,Math.min(40,off*-0.05))}px)`; });
  };
  sc.addEventListener("scroll",introScrollFn,{passive:true});
}
function markDot(i){ document.querySelectorAll("#introDots button").forEach((b,j)=>b.classList.toggle("on",j===i)); }
function introGo(i){ const p=document.querySelectorAll(".ipanel")[i]; if(p) p.scrollIntoView({behavior:"smooth"}); }
function dismissIntro(){
  const intro=document.getElementById("intro"), sc=document.getElementById("introScroll");
  intro.style.opacity="0"; intro.style.transform="scale(1.05)";
  setTimeout(()=>{ intro.classList.add("hidden"); },480);
  document.body.classList.remove("introlock");
  if(introObserver){ introObserver.disconnect(); introObserver=null; }
  if(introScrollFn){ sc.removeEventListener("scroll",introScrollFn); introScrollFn=null; }
  localStorage.setItem("jf_intro_seen","1");
}

boot();
