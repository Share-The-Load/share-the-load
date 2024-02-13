import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ImageStyle, TextStyle, ViewStyle, Image, View } from "react-native"
import { MainNavigatorParamList, MainTabScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
import { Route, RouteProp, useRoute } from "@react-navigation/native"
import { spacing } from "../theme"
import { useStores } from "../models"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

const welcomeLogo = require("../../assets/images/shareTheLoadLogo.png")

export const HomeScreen: FC<MainTabScreenProps<"Home">> = function HomeScreen(_props) {
  const {
    authenticationStore: { logout },
  } = useStores()
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
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
  paddingTop: spacing.lg + spacing.xl,
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
