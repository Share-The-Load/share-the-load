import React from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "./Text"
import { FloatingBubbles } from "./FloatingBubbles"
import { colors } from "../theme"

interface FullScreenLoaderProps {
  message?: string
}

export function FullScreenLoader({ message = "Loading..." }: FullScreenLoaderProps) {
  return (
    <View style={$container}>
      <FloatingBubbles count={14} />
      <Text preset="subheading" text={message} style={$text} />
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background,
}

const $text = {
  color: colors.palette.primary600,
  zIndex: 1,
} as const
