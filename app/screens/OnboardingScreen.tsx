import React, { FC, useEffect } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated"
import { Text, Button } from "app/components"
import { FloatingBubbles } from "app/components/FloatingBubbles"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

const welcomeLogo = require("../../assets/images/logo.png")

interface OnboardingScreenProps extends AppStackScreenProps<"Onboarding"> {}

export const OnboardingScreen: FC<OnboardingScreenProps> = function OnboardingScreen(_props) {
  const { navigation } = _props

  const logoOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.8)
  const titleOpacity = useSharedValue(0)
  const titleTranslateY = useSharedValue(20)
  const subtitleOpacity = useSharedValue(0)
  const subtitleTranslateY = useSharedValue(20)
  const buttonsOpacity = useSharedValue(0)
  const buttonsTranslateY = useSharedValue(30)

  useEffect(() => {
    logoOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }),
    )
    logoScale.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.2)) }),
    )
    titleOpacity.value = withDelay(
      700,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )
    titleTranslateY.value = withDelay(
      700,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )
    subtitleOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )
    subtitleTranslateY.value = withDelay(
      1000,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )
    buttonsOpacity.value = withDelay(
      1300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )
    buttonsTranslateY.value = withDelay(
      1300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }))

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }))

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }))

  return (
    <View style={$container}>
      <FloatingBubbles count={16} />

      <View style={$content}>
        <View style={$topSection}>
          <Animated.View style={logoStyle}>
            <Image style={$logo} source={welcomeLogo} resizeMode="contain" />
          </Animated.View>

          <Animated.View style={titleStyle}>
            <Text text="Share the Load" preset="heading" style={$title} />
          </Animated.View>

          <Animated.View style={subtitleStyle}>
            <Text
              text="Laundry is better together. Collaborate with your household and never miss a wash day again."
              style={$subtitle}
            />
          </Animated.View>
        </View>

        <Animated.View style={[buttonsStyle, $bottomSection]}>
          <Button
            text="Get Started"
            style={$getStartedButton}
            textStyle={$getStartedText}
            preset="primary"
            onPress={() => navigation.navigate("Register")}
          />
          <Button
            text="I already have an account"
            preset="clear"
            textStyle={$signInLink}
            onPress={() => navigation.navigate("Login")}
          />
        </Animated.View>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral100,
}

const $content: ViewStyle = {
  flex: 1,
  justifyContent: "space-between",
  paddingHorizontal: spacing.xl,
  paddingTop: 100,
  paddingBottom: 60,
}

const $topSection: ViewStyle = {
  alignItems: "center",
}

const $logo: ImageStyle = {
  height: 80,
  width: 220,
  marginBottom: spacing.xl,
}

const $title: TextStyle = {
  textAlign: "center",
  color: colors.palette.primary800,
  marginBottom: spacing.md,
  fontSize: 40,
  lineHeight: 48,
}

const $subtitle: TextStyle = {
  textAlign: "center",
  color: colors.palette.accent500,
  fontSize: 17,
  lineHeight: 26,
  paddingHorizontal: spacing.md,
}

const $bottomSection: ViewStyle = {
  alignItems: "center",
  gap: spacing.sm,
}

const $getStartedButton: ViewStyle = {
  width: "100%",
  borderRadius: 14,
  minHeight: 56,
  backgroundColor: colors.palette.primary600,
}

const $getStartedText: TextStyle = {
  fontSize: 18,
  color: colors.palette.neutral100,
}

const $signInLink: TextStyle = {
  color: colors.palette.primary700,
  fontSize: 15,
}
