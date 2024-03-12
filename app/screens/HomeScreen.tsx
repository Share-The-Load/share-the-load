import React, { FC } from "react"
import { ImageStyle, TextStyle, ViewStyle, Image, View } from "react-native"
import { MainTabScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
import { spacing } from "../theme"
import { useStores } from "../models"

const welcomeLogo = require("../../assets/images/shareTheLoadLogo.png")

export const HomeScreen: FC<MainTabScreenProps<"Home">> = function HomeScreen(_props) {
  const {
    authenticationStore: { logout },
  } = useStores()

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text style={$title} preset="heading" text="Home Screen" />

      <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />

      <View style={$buttonContainer}>
        <Button style={$button} tx="common.logOut" onPress={logout} />
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  paddingTop: spacing.xxs,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.xxl,
}

const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}

const $buttonContainer: ViewStyle = {
  marginBottom: spacing.md,
}
