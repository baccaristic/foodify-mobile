declare module '@fidme/react-native-wheel-of-fortune' {
  import type { ComponentType } from 'react';

  export type WheelOfFortuneReward =
    | string
    | number
    | {
        id?: string;
        value?: string | number;
        label?: string;
        [key: string]: unknown;
      };

  export interface WheelOfFortunePointerConfig {
    size?: number;
    color?: string;
    borderWidth?: number;
    borderColor?: string;
  }

  export interface WheelOfFortuneCenterConfig {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    text?: string;
    textColor?: string;
    textFontSize?: number;
    textFontWeight?: string;
    subText?: string;
    subTextColor?: string;
    subTextFontSize?: number;
  }

  export interface WheelOfFortuneOptions {
    rewards: WheelOfFortuneReward[];
    knobSize?: number;
    knobColor?: string;
    borderWidth?: number;
    borderColor?: string;
    innerRadius?: number;
    spinDuration?: number;
    backgroundColor?: string;
    textAngle?: 'horizontal' | 'vertical';
    rewardColors?: string[];
    rewardTextColors?: string[];
    textFontSize?: number;
    textFontWeight?: string;
    enableUserInteraction?: boolean;
    pointer?: WheelOfFortunePointerConfig;
    center?: WheelOfFortuneCenterConfig;
    [key: string]: unknown;
  }

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
