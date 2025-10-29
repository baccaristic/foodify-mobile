declare module '@fidme/react-native-wheel-of-fortune' {
  import type { ComponentType } from 'react';

  export type WheelOfFortuneReward = {
    value: string;
    label?: string;
    subLabel?: string;
    style?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export type WheelOfFortuneOptions = {
    rewards: WheelOfFortuneReward[];
    [key: string]: unknown;
  };

  export interface WheelOfFortuneRef {
    spin?: () => void;
    spinToReward?: (index: number) => void;
  }

  export interface WheelOfFortuneProps {
    options: WheelOfFortuneOptions;
    getWinner?: (reward: WheelOfFortuneReward, index: number) => void;
    onRef?: (ref: WheelOfFortuneRef | null) => void;
    [key: string]: unknown;
  }

  const WheelOfFortune: ComponentType<WheelOfFortuneProps>;

  export default WheelOfFortune;
}
