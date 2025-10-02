import { memo } from 'react';
import Svg, { Path, Rect, type SvgProps } from 'react-native-svg';

export type FoodifyPinProps = {
  color?: string;
} & SvgProps;

function FoodifyPin({ color = '#D61F26', width = 56, height = 72, ...props }: FoodifyPinProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 64 80"
      fill="none"
      accessibilityRole="image"
      {...props}
    >
      <Path
        fill={color}
        d="M32 0C14.327 0 0 14.596 0 32.59c0 11.977 6.59 22.94 14.394 32.073 5.756 6.709 12.4 12.586 17.18 16.556a3.268 3.268 0 0 0 4.852 0c4.78-3.97 11.424-9.847 17.18-16.556C57.41 55.53 64 44.567 64 32.59 64 14.596 49.673 0 32 0Z"
      />
      <Rect x={22.5} y={14} width={5} height={30} rx={1.6} fill="#FFFFFF" opacity={0.92} />
      <Rect x={29.5} y={10} width={5} height={34} rx={1.6} fill="#FFFFFF" opacity={0.92} />
      <Rect x={36.5} y={14} width={5} height={30} rx={1.6} fill="#FFFFFF" opacity={0.92} />
    </Svg>
  );
}

export default memo(FoodifyPin);
