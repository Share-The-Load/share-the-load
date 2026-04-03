import React, { FC, useEffect, useState } from "react"
import { Alert, ImageStyle, TextStyle, ViewStyle, Image, ActivityIndicator, View } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { FloatingBubbles } from "app/components/FloatingBubbles"
import { spacing, colors } from "app/theme"
import { api } from "app/services/api"

const welcomeLogo = require("../../assets/images/logo.png")

interface ForgotPasswordScreenProps extends AppStackScreenProps<"ForgotPassword"> {}

export const ForgotPasswordScreen: FC<ForgotPasswordScreenProps> =
  function ForgotPasswordScreen(_props) {
    const [emailOrUsername, setEmailOrUsername] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { navigation } = _props

    // Entrance animations
    const logoOpacity = useSharedValue(0)
    const formOpacity = useSharedValue(0)
    const formTranslateY = useSharedValue(30)

    useEffect(() => {
      logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      formOpacity.value = withDelay(
        300,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
      )
      formTranslateY.value = withDelay(
        300,
        withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
      )

      return () => {
        setEmailOrUsername("")
      }
    }, [])

    const logoStyle = useAnimatedStyle(() => ({
      opacity: logoOpacity.value,
    }))

    const formStyle = useAnimatedStyle(() => ({
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    }))

    const emailUsernameError = isSubmitted ? validationError() : ""

    function validationError() {
      if (emailOrUsername.length === 0) return "can't be blank"
      if (emailOrUsername.length < 5) return "must be at least 5 characters"
      return ""
    }

    function forgotPassword() {
      setIsSubmitted(true)
      if (validationError()) return

      setIsLoading(true)
      api
        .forgotPassword(emailOrUsername)
        .then(() => {
          setIsLoading(false)
          Alert.alert(
            "Success",
            "Temporary password has been sent to your email",
          )
        })
        .catch((error: any) => {
          setIsLoading(false)
          Alert.alert("Error", "An error occurred. Please try again later")
          console.log(error)
        })
    }

    return (
      <View style={$outerContainer}>
        <FloatingBubbles count={10} />

        <Screen
          preset="auto"
          contentContainerStyle={$screenContentContainer}
          safeAreaEdges={["top", "bottom"]}
          style={$screen}
        >
          <Animated.View style={[$logoContainer, logoStyle]}>
            <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />
          </Animated.View>

          <Animated.View style={[$formContainer, formStyle]}>
            <Text text="Forgot Password" preset="heading" style={$heading} />
            <Text
              text="Passwords are like socks... sometimes they get lost"
              style={$subheading}
            />

            {isLoading && <ActivityIndicator style={$loader} color={colors.palette.primary600} />}

            <TextField
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              containerStyle={$textField}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              label="Email or Username"
              placeholder="Enter your email or username"
              helper={emailUsernameError}
              status={emailUsernameError ? "error" : undefined}
              onSubmitEditing={forgotPassword}
            />

            <Button
              text="Get Temporary Password"
              style={$primaryButton}
              textStyle={$primaryButtonText}
              preset="primary"
              onPress={forgotPassword}
            />

            <View style={$divider}>
              <View style={$dividerLine} />
              <Text text="or" style={$dividerText} />
              <View style={$dividerLine} />
            </View>

            <Button
              text="Back to Sign In"
              style={$secondaryButton}
              textStyle={$secondaryButtonText}
              preset="default"
              onPress={() => navigation.goBack()}
            />
          </Animated.View>
        </Screen>
      </View>
    )
  }

const $outerContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral100,
}

const $screen: ViewStyle = {
  backgroundColor: "transparent",
}

const $screenContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  flexGrow: 1,
  justifyContent: "center",
}

const $logoContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.xl,
}

const $welcomeLogo: ImageStyle = {
  height: 60,
  width: 180,
}

const $formContainer: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  borderRadius: 20,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xl,
  shadowColor: colors.palette.primary800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 8,
}

const $heading: TextStyle = {
  marginBottom: spacing.xxs,
  color: colors.palette.primary800,
  fontSize: 30,
  lineHeight: 38,
}

const $subheading: TextStyle = {
  marginBottom: spacing.lg,
  color: colors.palette.accent500,
  fontSize: 16,
  lineHeight: 22,
}

const $loader: ViewStyle = {
  marginBottom: spacing.sm,
}

const $textField: ViewStyle = {
  marginBottom: spacing.md,
}

const $primaryButton: ViewStyle = {
  marginTop: spacing.md,
  borderRadius: 14,
  minHeight: 52,
  backgroundColor: colors.palette.primary600,
}

const $primaryButtonText: TextStyle = {
  fontSize: 17,
  color: colors.palette.neutral100,
}

const $divider: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: spacing.lg,
}

const $dividerLine: ViewStyle = {
  flex: 1,
  height: 1,
  backgroundColor: colors.palette.neutral300,
}

const $dividerText: TextStyle = {
  marginHorizontal: spacing.sm,
  color: colors.palette.neutral400,
  fontSize: 14,
}

const $secondaryButton: ViewStyle = {
  borderRadius: 14,
  minHeight: 52,
  borderColor: colors.palette.primary500,
  borderWidth: 1.5,
  backgroundColor: "transparent",
}

const $secondaryButtonText: TextStyle = {
  fontSize: 17,
  color: colors.palette.primary700,
}
