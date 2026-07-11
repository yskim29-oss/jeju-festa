# 제주 축제 도장 · Jeju Festa Stamp

제주 지속가능 축제 캘린더 + 게이미피케이션 웹앱. 축제를 다니며 방문 인증 도장을 모아 제주 지도를 완성하는 스탬프 투어.

## 실행

```bash
cd jeju-festa
node server.js
# → http://localhost:8790
```

의존성 없음(Node 내장 모듈만 사용). `npm install` 불필요.

## 구조

```
jeju-festa/
├── server.js        # 제로 의존성 백엔드 (정적 서빙 + REST API + 저장)
├── data/db.json     # 영구 저장소 (자동 생성: 사용자·세션·인증·리뷰)
└── public/
    ├── index.html   # 앱 셸 + SVG 아이콘 + Leaflet
    ├── styles.css   # 디자인 시스템 (글래스/따뜻한 제주 톤, 다크모드)
    └── app.js       # 프론트 로직 (i18n, 지도, 정렬, 인증 흐름)
```

## 기능

- **로그인/회원가입/데모** — scrypt 해시 비밀번호, 랜덤 토큰 세션 (`data/db.json`에 영구 저장)
- **캘린더** — 월별 축제, 카테고리 필터, `지속가능만` 토글, 정렬(날짜/평점/지속가능/이름)
- **지도** — OpenStreetMap(Leaflet) 실제 제주 좌표, 인증한 축제는 도장 핀으로 표시
- **검색** — 축제명·지역·키워드 + 정렬
- **상세** — 정보 + 평균 별점·지속가능성 + 리뷰 + 방문 인증 버튼 + 리뷰 작성
- **방문 인증 (3가지 방식, 서버 검증)** — 축제별로 하나의 방식이 지정됨:
  - **위치(GPS)** — `navigator.geolocation` + 하버사인 거리 계산, 25km 지오펜스. (데모: "현장 방문으로 인증" 버튼)
  - **QR 스캔** — 카메라 `BarcodeDetector`로 스캔, 또는 코드 직접 입력. 코드는 `JEJU-<축제id>` (예: `JEJU-2`), 대소문자 무시.
  - **티켓 사진** — 갤러리/카메라에서 사진 선택 후 인증.
  - 실패 시 서버가 422(`bad_qr`/`too_far`/`no_photo`)로 거절. 카메라·위치는 프리뷰 브라우저에서 차단되어 데모/수동 경로로 검증됨.
- **게이미피케이션** — 인증 → 도장 획득(컨페티) → 5칸 슬롯 채우기 → 1/3/5개 리워드 잠금 해제
- **마이/랭킹** — 진행률·리워드 현황, 백엔드 리더보드
- **KO/EN** — 모든 텍스트 `{ko, en}` 구조, 상단 언어 토글

## API

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/signup` `/api/login` `/api/logout` | 인증 |
| GET | `/api/me` | 내 정보 + 도장 |
| GET | `/api/festivals` `/api/festivals/:id` | 축제 목록/상세(집계 평점 포함) |
| POST | `/api/festivals/:id/checkin` | 방문 인증(도장) |
| POST | `/api/festivals/:id/review` | 리뷰 등록 |
| GET | `/api/leaderboard` | 랭킹 |
