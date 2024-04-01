import * as React from "react"
import {
  Image,
  ImageRequireSource,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"

export interface AvatarSelectProps extends TouchableOpacityProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  avatar: ImageRequireSource

  selected?: boolean
}

/**
 * Describe your component here
 */
export const AvatarSelect = observer(function AvatarSelect(props: AvatarSelectProps) {
  const { style, avatar, selected, onPress } = props
  const $styles = [$container, style]

  return (
    <TouchableOpacity onPress={onPress} style={$styles}>
      {selected ? (
        <Image style={$selectedImageStyle} source={avatar} />
      ) : (
        <Image style={$imageStyle} source={avatar} />
      )}
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
  opacity: 0.5,
}

const $selectedImageStyle: StyleProp<ImageStyle> = {
  borderWidth: 4,
  borderColor: colors.palette.primary700,
  width: 80,
  height: 80,
}
