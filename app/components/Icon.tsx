import * as React from "react";
import { ComponentType } from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

export type IconTypes = keyof typeof iconRegistry;

interface IconProps extends TouchableOpacityProps {
  icon: IconTypes;
  color?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps["onPress"];
}

export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...WrapperProps
  } = props;

  const isPressable = !!WrapperProps.onPress;
  const Wrapper = (
    WrapperProps?.onPress ? TouchableOpacity : View
  ) as ComponentType<TouchableOpacityProps | ViewProps>;

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    color !== undefined && { tintColor: color },
    size !== undefined && { width: size, height: size },
    $imageStyleOverride,
  ];

  return (
    <Wrapper
      accessibilityRole={isPressable ? "imagebutton" : undefined}
      {...WrapperProps}
      style={$containerStyleOverride}
    >
      <Image style={$imageStyle} source={iconRegistry[icon]} />
    </Wrapper>
  );
}

export const iconRegistry = {
  back: require("../../assets/icons/back.png"),
  caretLeft: require("../../assets/icons/caretLeft.png"),
  caretRight: require("../../assets/icons/caretRight.png"),
  home: require("../../assets/icons/home.png"),
  hidden: require("../../assets/icons/hidden.png"),
  lock: require("../../assets/icons/lock.png"),
  menu: require("../../assets/icons/menu.png"),
  more: require("../../assets/icons/more.png"),
  people: require("../../assets/icons/people.png"),
  person: require("../../assets/icons/person.png"),
  user_minus: require("../../assets/icons/user-minus.png"),
  settings: require("../../assets/icons/settings.png"),
  square_minus: require("../../assets/icons/square-minus.png"),
  trash: require("../../assets/icons/trash.png"),
  view: require("../../assets/icons/view.png"),
  users: require("../../assets/icons/users.png"),
  x: require("../../assets/icons/x.png"),
};

const $imageStyleBase: ImageStyle = {
  resizeMode: "contain",
};
