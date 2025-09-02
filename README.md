# FigJam Clone - 협업 화이트보드 애플리케이션

Next.js와 TypeScript를 사용하여 구축된 FigJam 스타일의 협업 화이트보드 애플리케이션입니다.

## 🚀 주요 기능

### 🎨 화이트보드 기능

- **다양한 도구**: 펜, 지우개, 손, 텍스트, 도형, 이미지
- **색상 팔레트**: 18가지 기본 색상 + 커스텀 색상 선택
- **선 굵기 조절**: 1px ~ 16px까지 다양한 선 굵기
- **실시간 그리기**: 부드러운 그리기 경험
- **실행 취소/다시 실행**: 작업 히스토리 관리

### 👥 협업 기능

- **실시간 협업**: 여러 사용자가 동시에 작업
- **사용자 커서**: 다른 참여자의 위치 실시간 표시
- **댓글 시스템**: 화면에 직접 댓글 추가 및 답글
- **사용자 관리**: 참여자 목록 및 상태 표시
- **권한 관리**: 보기, 편집, 댓글 권한 설정

### 📞 통신 기능

- **음성/비디오 통화**: WebRTC 기반 실시간 통신
- **화면 공유**: 화이트보드 화면 공유
- **오디오 시각화**: 실시간 오디오 레벨 표시
- **통화 컨트롤**: 음소거, 비디오 켜기/끄기

### 🔧 기술적 특징

- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 모던하고 반응형 UI
- **Context API**: 상태 관리
- **Canvas API**: 고성능 그래픽 렌더링
- **WebRTC**: 실시간 통신

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas API
- **Communication**: WebRTC, WebSocket
- **State Management**: React Context + useReducer
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
figjam-clone/
├── public/
│   ├── favicon.ico
│   └── sounds/
│       ├── ringtone.mp3
│       └── notification.mp3
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── whiteboard/          # 화이트보드 관련 컴포넌트
│   │   ├── communication/       # 통신 관련 컴포넌트
│   │   ├── collaboration/       # 협업 관련 컴포넌트
│   │   ├── layout/              # 레이아웃 컴포넌트
│   │   └── providers/           # Context Provider들
│   ├── hooks/                   # 커스텀 훅들
│   ├── lib/                     # 유틸리티 및 타입
│   └── styles/                  # 스타일 파일
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 협업 서버 실행 (별도 터미널)

```bash
npm run websocket
```

### 4. WebRTC 시그널링 서버 실행 (별도 터미널)

```bash
npm run webrtc-signaling
```

### 5. 모든 서비스 동시 실행

```bash
npm run dev:full
```

## 🔧 사용법

### 기본 그리기

1. 왼쪽 도구 모음에서 원하는 도구 선택
2. 색상 팔레트에서 색상 선택
3. 선 굵기 조절
4. 캔버스에 그리기

### 협업 시작

1. 오른쪽 상단의 공유 버튼 클릭
2. 링크 복사 또는 사용자 초대
3. 권한 설정 (보기/편집/댓글)

### 통화 시작

1. 왼쪽 하단의 통화 버튼 클릭
2. 마이크/카메라 권한 허용
3. 참여자와 실시간 통신

## 🌟 주요 컴포넌트

### FigJamWhiteboard

메인 화이트보드 컴포넌트로 캔버스 렌더링과 이벤트 처리를 담당합니다.

### Toolbar

도구 선택, 색상 설정, 실행 취소/다시 실행 등의 기능을 제공합니다.

### ActionPanel

요소 목록, 협업 정보, 설정을 탭으로 구분하여 표시합니다.

### WebRTCWrapper

음성/비디오 통화, 화면 공유 등의 통신 기능을 관리합니다.

## 🔒 환경 변수

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_WEBRTC_SIGNALING_URL=ws://localhost:3001
NEXT_PUBLIC_COLLABORATION_SERVER_URL=ws://localhost:1234
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**참고**: 이 프로젝트는 학습 목적으로 제작되었으며, 실제 FigJam과는 관련이 없습니다.
