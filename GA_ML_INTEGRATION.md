# GA-ML Integration Guide

이 프로젝트는 이제 `단독 Vite 앱`으로도 실행할 수 있고, 기존 웹페이지에 `임베드 컴포넌트`처럼 붙일 수도 있게 정리되어 있습니다.

## 준비된 진입점

- React 컴포넌트: `src/embed.tsx`
- 재사용 export 묶음: `src/index.ts`
- 임베드용 컴포넌트: `HoldemTournamentEmbed`
- DOM 마운트 함수: `mountHoldemTournament(...)`

## React 페이지에 붙이기

GA-ML가 React 기반이면 가장 쉬운 방식은 아래입니다.

```tsx
import { HoldemTournamentEmbed } from 'path-to-game/src/embed';

export function PokerSection() {
  return (
    <section style={{ minHeight: 860 }}>
      <HoldemTournamentEmbed
        initialSeed={12345}
        onTournamentComplete={(result) => {
          console.log('tournament finished', result);
        }}
      />
    </section>
  );
}
```

`onTournamentComplete` payload:

```ts
{
  reason: 'winner' | 'human-busted';
  winnerId: string | null;
  winnerName: string | null;
  playerWon: boolean;
  handNumber: number;
  level: number;
}
```

## 일반 DOM에 붙이기

React 페이지가 아니어도 마운트 함수로 붙일 수 있습니다.

```ts
import { mountHoldemTournament } from 'path-to-game/src/embed';

const mountPoint = document.getElementById('ga-ml-holdem');

if (mountPoint) {
  const app = mountHoldemTournament(mountPoint, {
    initialSeed: Date.now(),
    onTournamentComplete: (result) => {
      console.log(result);
    },
  });

  // 필요 시
  // app.unmount();
}
```

## 스타일/전역 영향

호스트 페이지에 영향을 덜 주도록 정리한 내용:

- 게임 전용 CSS 변수는 `.holdem-app-theme` 아래로 스코프됨
- 버튼/인풋/박스사이징 리셋도 게임 루트 아래로만 적용됨
- `body` 배경과 `html/body/#root` 높이 설정은 `src/styles/fullscreen.css`로 분리됨

즉:

- `src/main.tsx`는 풀스크린 앱용
- `src/embed.tsx`는 호스트 페이지 임베드용

## 이식 체크리스트

1. GA-ML 쪽 컨테이너에 충분한 높이를 준다.
   - 데스크톱 권장: `min-height: 720px`
   - 큰 섹션 권장: `min-height: 860px`
2. 단일 인스턴스 기준으로 사용한다.
   - 현재 Zustand store가 전역 singleton이라 동시 다중 게임 인스턴스는 권장하지 않음
3. 필요하면 `onTournamentComplete`로 결과를 받아 GA-ML 이벤트/모달/CTA와 연결한다.
4. 외부 디자인 시스템에 맞추려면:
   - [variables.css](/Users/gamlebae/Desktop/game%20test/src/styles/variables.css)
   - [TableScreen.module.css](/Users/gamlebae/Desktop/game%20test/src/components/table/TableScreen.module.css)
   - [SeatView.module.css](/Users/gamlebae/Desktop/game%20test/src/components/seat/SeatView.module.css)
   - [HeroHud.module.css](/Users/gamlebae/Desktop/game%20test/src/components/seat/HeroHud.module.css)
   부터 조정하면 됨

## 권장 이식 순서

1. 먼저 `HoldemTournamentEmbed`를 GA-ML 내부 라우트/섹션에 넣기
2. 높이/여백만 맞춰서 레이아웃 안정화
3. `onTournamentComplete`를 GA-ML 분석/전환 이벤트에 연결
4. 마지막으로 색상, 폰트, 버튼을 GA-ML 디자인 시스템에 맞춰 스킨 작업
