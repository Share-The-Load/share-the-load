import React, { FC } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Button, Text } from "app/components"
import { useAuthStore } from "../store"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { useHeader } from "../utils/useHeader"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

const laundryRoom = require("../../assets/images/laundry_room.png")

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen(_props) {
  const { navigation } = _props
  const logout = useAuthStore((s) => s.logout)

  function goNext(mode: "find" | "create") {
    navigation.navigate("Group", { mode })
  }

  useHeader(
    {
      rightText: "Log Out",
      onRightPress: logout,
    },
    [logout],
  )

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  return (
    <View style={$container}>
      <View style={$topContainer}>
        <Image style={$welcomeLogo} source={laundryRoom} resizeMode="contain" />
        <Text
          testID="welcome-heading"
          style={$welcomeHeading}
          text="You're almost ready to launder..."
          preset="heading"
        />
        <Text text="(you can finally wear some clean socks)" preset="subheading" />
      </View>

      <View style={[$bottomContainer, $bottomContainerInsets]}>
        <Text
          style={{ color: colors.palette.secondary500 }}
          text="Time to join the laundry revolution. Click a button below to get started."
          size="md"
        />
        <View>
          <Button
            testID="next-screen-button"
            preset="default"
            text="Find Group"
            style={{ marginVertical: spacing.sm }}
            onPress={() => goNext("find")}
          />
          <Button
            testID="next-screen-button"
            preset="primary"
            text="Create Group"
            onPress={() => goNext("create")}
          />
        </View>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $topContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
}

const $bottomContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
}
const $welcomeLogo: ImageStyle = {
  height: 250,
  width: "100%",
  marginBottom: spacing.md,
}

const $welcomeHeading: TextStyle = {
  marginBottom: spacing.md,
}
