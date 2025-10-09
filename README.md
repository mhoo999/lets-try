# lets try (haime) – 반지 시뮬레이션 웹 서비스

![haime 로고](public/haime-logo.png)

> **lets try**는 haime 브랜드에서 제공하는 반지 시뮬레이션 웹 서비스입니다. 사용자가 손등 사진을 업로드하면, 각 손가락에 다양한 반지를 가상으로 착용해볼 수 있고, 반지 종류·색상·위치를 자유롭게 선택할 수 있습니다. 완성된 이미지는 SNS로 공유할 수 있습니다. 모든 과정은 개인정보 보호를 최우선으로 클라이언트에서만 처리됩니다.

---

## 📝 프로젝트 개요
- 사용자가 손등 이미지를 업로드하면, 각 손가락에 다양한 반지를 시뮬레이션하여 착용해볼 수 있는 서비스입니다.
- 반지 종류, 색상, 위치를 선택해 실제 착용 이미지를 미리 볼 수 있습니다.
- 결과 이미지는 SNS, 메신저 등으로 공유할 수 있습니다.
- 모든 처리는 100% 클라이언트에서 이루어지며, 개인정보(손 사진)는 서버에 저장하지 않습니다.

---

## 🌟 주요 기능
- **손등 이미지 업로드**: 가이드 이미지를 참고하거나 직접 촬영한 손등 사진을 업로드(브라우저 내에서만 처리)
- **손가락 인식**: MediaPipe Hands를 활용한 클라이언트 손가락 위치 인식
- **반지 시뮬레이션**: 각 손가락을 선택해 반지 종류/색상 선택, 여러 손가락에 각각 다른 반지/색상 적용 가능
- **직관적인 UI**: 3단계 프로세스(사진 업로드 → 반지 선택 → 미리보기 & 공유)
- **반지 데이터 관리**: Supabase Storage에 저장된 반지 이미지 사용
- **소셜 공유**: Web Share API, X(Twitter) 공유, 하이메 스토어 링크
- **개인정보 보호**: 사용자의 손 사진은 절대 서버에 저장하지 않음
- **모바일 최적화**: 반응형 UI, 터치 친화적

---

## 🖼️ 사용자 플로우
1. **Step 1: Upload Photo** - 손등 사진 업로드/촬영
2. **Step 2: Choose Ring** - 반지 종류/색상 선택 & 손가락 선택
3. **Step 3: Preview & Share** - 결과 확인 및 공유

---

## 🛠️ 기술 스택
- **프론트엔드**: Next.js 15.3.1 (React 19), TypeScript, Tailwind CSS
- **손가락 인식**: MediaPipe Hands (클라이언트 라이브러리)
- **이미지 처리**: html2canvas (스크린샷 캡처)
- **데이터베이스**: Supabase (반지 데이터 및 이미지 저장)
- **배포**: Vercel
- **분석**: Vercel Analytics

---

## 🗄️ Supabase 설정 가이드

이 프로젝트는 Supabase를 사용하여 반지 데이터를 관리합니다.

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com/)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 API URL과 anon key를 확인합니다.

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 값을 추가합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Storage 버킷 생성
Supabase Dashboard → Storage에서 새 버킷을 생성합니다:
- 버킷 이름: `ring-images`
- Public 버킷으로 설정

### 4. 반지 이미지 업로드
Storage 버킷에 반지 이미지를 업로드합니다:
```
ring-images/
  ├── mini_mushroom_ring/
  │   ├── blue.png
  │   ├── green.png
  │   ├── pink.png
  │   └── purple.png
  ├── mini_bear_ring/
  │   ├── blue.png
  │   └── pink.png
  └── ...
```

### 5. rings.json 파일 구조
`public/data/rings.json` 파일에 반지 데이터를 정의합니다:

```json
[
  {
    "id": "mini_mushroom_ring",
    "name": "mini_mushroom_ring",
    "description": "귀여운 미니 버섯 반지",
    "availableColors": [
      {
        "colorName": "Blue",
        "imageUrl": "https://your-supabase-url/storage/v1/object/public/ring-images/mini_mushroom_ring/blue.png"
      },
      {
        "colorName": "Green",
        "imageUrl": "https://your-supabase-url/storage/v1/object/public/ring-images/mini_mushroom_ring/green.png"
      }
    ]
  }
]
```

### 6. 이미지 URL 형식
Supabase Storage의 공개 URL 형식:
```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/[BUCKET_NAME]/[FILE_PATH]
```

---

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 18.x 이상
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone https://github.com/mhoo999/lets-try.git
cd lets-try

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase 정보 입력

# 개발 서버 실행
npm run dev
```

### 빌드
```bash
npm run build
npm start
```

---

## 📁 프로젝트 구조
```
lets-try/
├── app/
│   ├── components/          # React 컴포넌트
│   │   ├── HandLandmarkDetector.tsx  # MediaPipe 손가락 인식
│   │   ├── RingSelectionModal.tsx    # 반지 선택 모달
│   │   ├── FingerPills.tsx           # 손가락 선택 버튼
│   │   ├── CameraCapture.tsx         # 카메라 캡처
│   │   └── ...
│   ├── page.tsx             # 메인 페이지
│   └── layout.tsx           # 레이아웃
├── public/
│   ├── data/
│   │   └── rings.json       # 반지 데이터
│   └── hand.png             # 손 가이드 이미지
└── README.md
```

---

## 🎨 디자인 시스템
- **브랜드 컬러**: `#d97a7c` (메인 핑크)
- **배경 그라데이션**: `from-[#fef5f5] to-white`
- **폰트**: 시스템 기본 폰트
- **버튼 스타일**: Rounded-full, shadow-md

---

## 📱 지원 브라우저
- Chrome/Edge (최신 버전)
- Safari (최신 버전)
- Firefox (최신 버전)
- 모바일 브라우저 (iOS Safari, Chrome)

---

## 🔒 개인정보 보호
- 사용자가 업로드한 손 사진은 **절대 서버에 전송되지 않습니다**
- 모든 이미지 처리는 브라우저(클라이언트)에서만 수행됩니다
- MediaPipe Hands 역시 클라이언트에서만 동작합니다

---

## 📄 라이선스
이 프로젝트는 haime 브랜드의 소유이며, 모든 권리는 haime에 있습니다.

---

## 🔗 링크
- **하이메 스토어**: [https://www.haime.shop/](https://www.haime.shop/)
- **서비스 URL**: [https://lets-try-mu.vercel.app/](https://lets-try-mu.vercel.app/)

---

## 🤝 기여
이 프로젝트는 haime 내부 프로젝트입니다.

---

## 📧 문의
프로젝트 관련 문의는 haime 공식 채널을 통해 주시기 바랍니다.
