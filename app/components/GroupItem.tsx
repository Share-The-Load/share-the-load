import * as React from "react"
import {
  Image,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { Text, TextProps } from "app/components/Text"
import { Icon } from "./Icon"
import { getGroupImage } from "app/constants/images"

export interface GroupItemProps extends TouchableOpacityProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  height?: number

  topSeparator?: boolean

  bottomSeparator?: boolean

  text?: TextProps["text"]

  owner?: string

  avatarId?: number

  hasPasscode?: boolean

  membersCount?: number
}

/**
 * Describe your component here
 */
export const GroupItem = observer(function GroupItem(props: GroupItemProps) {
  const {
    bottomSeparator,
    height = 56,
    style,
    text,
    owner,
    topSeparator,
    hasPasscode,
    membersCount,
    avatarId,
    ...TouchableOpacityProps
  } = props

  const $containerStyles = [topSeparator && $separatorTop, bottomSeparator && $separatorBottom]

  const $touchableStyles = [$touchableStyle, { minHeight: height }, style]

  return (
    <View style={$containerStyles}>
      <TouchableOpacity {...TouchableOpacityProps} style={$touchableStyles}>
        <Image
          style={{ alignSelf: "center", marginEnd: spacing.md, width: 50, height: 50 }}
          source={getGroupImage(avatarId)}
        />
        <View style={$textContainer}>
          <Text text={text} style={$titleStyle}></Text>
          <Text text={`Owner: ${owner}`} style={$subheaderStyle}></Text>
        </View>

        {hasPasscode && <Icon containerStyle={$lockIcon} icon="lock" />}

        <View style={$iconContainer}>
          <Text text={(membersCount ?? 0).toString()} style={{ marginRight: spacing.xxs }} />
          <Icon size={24} icon="people" />
        </View>
      </TouchableOpacity>
    </View>
  )
})

const $textContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "flex-start",
  alignSelf: "center",
  flexGrow: 1,
}

const $separatorTop: ViewStyle = {
  borderTopWidth: 1,
  borderTopColor: colors.separator,
}

const $separatorBottom: ViewStyle = {
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
}

const $titleStyle: TextStyle = {
  paddingTop: spacing.xs,
  flexGrow: 1,
  flexShrink: 1,
  color: colors.palette.primary600,
  fontSize: 25,
}
const $subheaderStyle: TextStyle = {
  paddingVertical: spacing.xxs,
  flexGrow: 1,
  flexShrink: 1,
  color: colors.textDim,
}

const $touchableStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
}

const $iconContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  flexDirection: "row",
  marginLeft: spacing.md,
}
const $lockIcon: ViewStyle = {
  alignSelf: "center",
  flexDirection: "row",
}
