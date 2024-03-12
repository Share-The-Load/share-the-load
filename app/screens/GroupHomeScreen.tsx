import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Image, TextStyle, ImageStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"

const welcomeLogo = require("../../assets/images/shareTheLoadLogo.png")
const avatar = require("../../assets/images/app-icon-all.png")
interface GroupHomeScreenProps extends AppStackScreenProps<"GroupHome"> {}

export const GroupHomeScreen: FC<GroupHomeScreenProps> = observer(function GroupHomeScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  const {
    authenticationStore: { logout },
    groupStore,
  } = useStores()

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text style={$title} preset="heading" text="Your Groups" />

      <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />

      <Text text={groupStore.yourGroup?.name || "No group"} />
      <Text style={$sloganText} text={groupStore.yourGroup?.slogan} />

      <View style={$buttonContainer}>
        <Button style={$button} tx="common.logOut" onPress={logout} />
      </View>
    </Screen>
  )
})

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

const $sloganText: TextStyle = {
  color: colors.textDim,
  fontStyle: "italic",
  fontSize: 16,
}
