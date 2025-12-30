# 작업반장 디자인 시스템 문서

## 개요

모바일 환경에 최적화된 깨끗하고 미니멀한 관리자 페이지 디자인 시스템입니다.

## 색상 팔레트 (Color Palette)

### 배경색
- **주 배경색**: `#FFFFFF` (순백색)
- **보조 배경색**: `#F1F3F5` (연한 회색)

### 텍스트
- **기본 텍스트**: `#212529` (거의 검은색)
- **보조 텍스트**: `#868E96` (회색)

### 강조색
- **핵심 강조색**: `#FFD644` (따뜻한 노란색)
  - 주요 버튼
  - 활성화된 탭 하단 라인
  - 강조 요소

### 구분선
- **테두리/구분선**: `#DEE2E6` (매우 연한 회색)

### 버튼
- **주요 버튼**: `#FFD644` 배경 + 검은색 텍스트
- **보조 버튼**: `#F1F3F5` 배경 + 어두운 회색 텍스트

## 타이포그래피 (Typography)

### 폰트 패밀리
```css
font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", "Segoe UI", "Roboto", sans-serif;
```

### 폰트 사이즈
- **페이지 제목**: 20px, 굵게 (700)
- **섹션 제목**: 16px, 굵게 (700)
- **본문**: 14px, 보통 (400)

## 모서리 반경 (Border Radius)

- **Small**: 4px
- **Medium**: 8px (기본값)
- **Large**: 12px
- **Round**: 24px (로고 등)

## 간격 (Spacing)

- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

## 핵심 컴포넌트

### 1. Header
- 좌측: 뒤로가기 화살표
- 중앙: JAKUP 로고 (노란색 배경, 둥근 모서리)
- 우측: 로그아웃 텍스트 링크

### 2. 탭 (Tabs)
- 활성화된 탭: 텍스트 아래 2px 노란색 밑줄
- 비활성화된 탭: 회색 텍스트

### 3. 버튼 (Buttons)
- 주요 버튼: 노란색 배경, 8px 모서리 반경
- 보조 버튼: 연한 회색 배경
- 패딩: 14px 24px
- 폰트: 16px, 굵게

### 4. 입력 필드 (Input Fields)
- 테두리: 1px solid #DEE2E6
- 모서리: 8px
- 패딩: 12px 16px
- 포커스: 테두리 색상 변경

### 5. 테이블/리스트
- 헤더: 연한 회색 배경 (#F1F3F5)
- 행 구분선: 1px solid #DEE2E6
- 패딩: 16px

### 6. 정보 표시 UI
- 라벨 영역: 연한 회색 배경 (#F1F3F5)
- 값 영역: 흰색 배경
- 명확한 구분을 위해 배경색 차이 활용

## 페이지 구조

### TaskListPage (근무자 리스트)
- 헤더 + 탭 네비게이션
- 현장명 제목
- 근무일 필터
- 근무자 테이블 (이름, 생년월일, 작업내역)

### WorkerDetailPage (근로자 상세정보)
- 헤더
- 페이지 제목
- 기본정보 섹션 (라벨-값 쌍)
- 작업내역 섹션 + 등록하기 버튼

### TaskEntryPage (작업공수입력)
- 헤더
- 폼 필드들
- 작업내용 선택
- 첨부파일
- 공수 라디오 버튼 (1, 2, 3)
- 비고
- 저장/뒤로가기 버튼

### ExpenseEntryPage (지출비용 등록)
- 헤더 + 탭 네비게이션
- 내용 입력
- 증빙 첨부
- 지출 등록하기 버튼
- 푸터 (회사 정보)

## 파일 구조

```
client/src/
├── styles/
│   ├── theme.ts          # 테마 설정
│   └── GlobalStyles.tsx  # 전역 스타일
├── components/
│   └── common/
│       ├── Header.tsx
│       ├── Tabs.tsx
│       ├── StyledButton.tsx
│       └── StyledInput.tsx
└── pages/
    ├── TaskListPage.tsx
    ├── WorkerDetailPage.tsx
    ├── TaskEntryPage.tsx
    └── ExpenseEntryPage.tsx
```

## 사용 예시

### 버튼
```tsx
import StyledButton from '../components/common/StyledButton';

<StyledButton variant="primary">저장</StyledButton>
<StyledButton variant="secondary">취소</StyledButton>
```

### 입력 필드
```tsx
import { StyledInput, StyledSelect, StyledTextarea } from '../components/common/StyledInput';

<StyledInput type="text" placeholder="입력하세요" />
<StyledSelect>
  <option>선택</option>
</StyledSelect>
<StyledTextarea placeholder="내용 입력" />
```

### 헤더
```tsx
import Header from '../components/common/Header';

<Header showBackButton={true} />
```

### 탭
```tsx
import Tabs from '../components/common/Tabs';

const tabs = [
  { id: 'tab1', label: '탭 1' },
  { id: 'tab2', label: '탭 2' },
];

<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
```

## 접근성 고려사항

- 충분한 색상 대비 (텍스트와 배경)
- 명확한 포커스 상태
- 터치 친화적 버튼 크기 (최소 44x44px)
- 시맨틱 HTML 사용

## 반응형 디자인

- 모바일 우선 접근
- 최대 너비 800px (TaskEntryPage, ExpenseEntryPage)
- 유동적인 레이아웃

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)
- 모바일 브라우저

---

작성일: 2025-10-16
버전: 1.0.0

