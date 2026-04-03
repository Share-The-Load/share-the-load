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
export const GroupItem = function GroupItem(props: GroupItemProps) {
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
      <TouchableOpacity {...TouchableOpacityProps} style={$touchableStyles} activeOpacity={0.7}>
        <Image
          style={$avatar}
          source={getGroupImage(avatarId)}
        />
        <View style={$textContainer}>
          <Text text={text} style={$titleStyle} numberOfLines={1} />
          <Text text={`Owner: ${owner}`} style={$subheaderStyle} numberOfLines={1} />
          <View style={$metaRow}>
            <Icon size={16} icon="people" color={colors.textDim} />
            <Text text={`${membersCount ?? 0} members`} style={$metaText} />
            {hasPasscode && (
              <>
                <View style={$metaDot} />
                <Icon size={14} icon="lock" color={colors.textDim} />
                <Text text="Passcode" style={$metaText} />
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const $textContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "flex-start",
  flexGrow: 1,
  flexShrink: 1,
}

const $separatorTop: ViewStyle = {
  borderTopWidth: 1,
  borderTopColor: colors.separator,
}

const $separatorBottom: ViewStyle = {
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
}

const $avatar: any = {
  width: 52,
  height: 52,
  borderRadius: 12,
  marginRight: spacing.sm,
}

const $titleStyle: TextStyle = {
  color: colors.palette.primary700,
  fontSize: 17,
  fontWeight: "600",
  marginBottom: spacing.xxxs,
}

const $subheaderStyle: TextStyle = {
  color: colors.text,
  fontSize: 14,
  marginBottom: spacing.xxs,
}

const $metaRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $metaText: TextStyle = {
  color: colors.textDim,
  fontSize: 13,
  marginLeft: spacing.xxxs,
}

const $metaDot: ViewStyle = {
  width: 3,
  height: 3,
  borderRadius: 1.5,
  backgroundColor: colors.palette.neutral400,
  marginHorizontal: spacing.xs,
}

const $touchableStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
}
