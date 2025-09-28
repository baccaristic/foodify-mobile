import { Platform } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const normalize = (size: number) => {
  return Platform.OS === "ios" ? size : moderateScale(size);
};
export const normalizeV = (size: number) => {
  return Platform.OS === "ios" ? size : verticalScale(size);
};
export const normalizeH = (size: number) => {
  return Platform.OS === "ios" ? size : scale(size);
};
