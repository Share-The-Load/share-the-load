import * as React from "react"
import {
  Image,
  ImageStyle,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing, typography } from "app/theme"
import { Text } from "app/components/Text"
import { getLoadImage } from "app/constants/images"

export interface ImageSelectProps extends TouchableOpacityProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  label: string
}

/**
 * Describe your component here
 */
export const ImageSelect = observer(function ImageSelect(props: ImageSelectProps) {
  const { style, label, onPress } = props
  const $styles = [$container, style]

  return (
    <TouchableOpacity onPress={onPress} style={$styles}>
      <Image style={$imageStyle} source={getLoadImage(label)} />
      <Text style={$text} text={label}></Text>
    </TouchableOpacity>
  )
})

const $container: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.sm,
  marginRight: spacing.sm,
}

const $imageStyle: StyleProp<ImageStyle> = {
  borderWidth: 1,
  width: 80,
  height: 80,
}

const $text: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.secondary500,
}
