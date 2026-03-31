import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { ImageStyle, TextInput, TextStyle, ViewStyle, Image, ActivityIndicator, View } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "../components"
import { FloatingBubbles } from "../components/FloatingBubbles"
import { useAuthStore } from "../store"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import axios from "app/utils/axios"

const welcomeLogo = require("../../assets/images/logo.png")

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = function LoginScreen(_props) {
  const authPasswordInput = useRef<TextInput>(null)

  const [authPassword, setAuthPassword] = useState("")
  const [authEmailUsername, setAuthEmailUsername] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const [loginError, setLoginError] = useState("")
  const { navigation } = _props

  const {
    setAuthToken,
    setRefreshToken,
    distributeAuthToken,
    setUserGroupId,
    setUserId,
    setIsValidated,
  } = useAuthStore()

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
      setAuthPassword("")
      setAuthEmailUsername("")
    }
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }))

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }))

  const error = isSubmitted ? usernameEmailValidationError() : ""
  const errorPassword = isSubmitted ? passwordValidationError() : ""

  function usernameEmailValidationError() {
    if (authEmailUsername.length === 0) return "can't be blank"
    return ""
  }
  function passwordValidationError() {
    if (authPassword.length === 0) return "can't be blank"
    return ""
  }

  function login() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (usernameEmailValidationError() != "" || passwordValidationError() != "") return
    setIsLoading(true)

    axios
      .post("/account/login", { username: authEmailUsername, password: authPassword })
      .then((res) => {
        setIsSubmitted(false)
        setAuthPassword("")
        setAuthEmailUsername("")
        if (res.data.user.groupId !== null) setUserGroupId(res.data.user.groupId)
        setAuthToken(res.data.user.token)
        setRefreshToken(res.data.user.refreshToken)
        distributeAuthToken()
        setIsValidated(true)
        setUserId(res.data.user.userId)
        setIsLoading(false)
      })
      .catch((err) => {
        if (err.includes("Share the Load is not available")) {
          setLoginError(err)
        } else setLoginError("Invalid username or password")
        setIsLoading(false)
      })
  }

  function register() {
    navigation.navigate("Register")
  }

  function forgotPassword() {
    navigation.navigate("ForgotPassword")
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isAuthPasswordHidden ? "hidden" : "view"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden],
  )

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
          <Text testID="login-heading" text="Welcome Back" preset="heading" style={$signIn} />
          <Text
            text="Sign in to your account"
            style={$enterDetails}
          />

          {isLoading && <ActivityIndicator style={$loader} color={colors.palette.primary600} />}

          <TextField
            value={authEmailUsername}
            onChangeText={setAuthEmailUsername}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email or Username"
            placeholder="Enter your email or username"
            helper={error}
            status={error ? "error" : undefined}
            onSubmitEditing={() => authPasswordInput.current?.focus()}
          />

          <TextField
            ref={authPasswordInput}
            value={authPassword}
            onChangeText={setAuthPassword}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            secureTextEntry={isAuthPasswordHidden}
            label="Password"
            placeholder="Enter your password"
            helper={errorPassword}
            status={errorPassword ? "error" : undefined}
            onSubmitEditing={login}
            RightAccessory={PasswordRightAccessory}
          />

          {loginError !== "" && (
            <View style={$errorContainer}>
              <Text text={loginError} size="sm" weight="light" style={$hint} />
            </View>
          )}

          <Button
            textStyle={$forgotPasswordText}
            preset="clear"
            text="Forgot Password?"
            onPress={forgotPassword}
          />

          <Button
            testID="login-button"
            text="Sign In"
            style={$signInButton}
            textStyle={$signInButtonText}
            preset="primary"
            onPress={login}
          />

          <View style={$divider}>
            <View style={$dividerLine} />
            <Text text="or" style={$dividerText} />
            <View style={$dividerLine} />
          </View>

          <Button
            testID="register-button"
            text="Create an Account"
            style={$registerButton}
            textStyle={$registerButtonText}
            preset="default"
            onPress={register}
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

const $signIn: TextStyle = {
  marginBottom: spacing.xxs,
  color: colors.palette.primary800,
  fontSize: 30,
  lineHeight: 38,
}

const $enterDetails: TextStyle = {
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

const $errorContainer: ViewStyle = {
  backgroundColor: colors.errorBackground,
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  marginBottom: spacing.sm,
}

const $hint: TextStyle = {
  color: colors.error,
}

const $forgotPasswordText: TextStyle = {
  color: colors.palette.primary700,
  fontSize: 14,
}

const $signInButton: ViewStyle = {
  marginTop: spacing.md,
  borderRadius: 14,
  minHeight: 52,
  backgroundColor: colors.palette.primary600,
}

const $signInButtonText: TextStyle = {
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

const $registerButton: ViewStyle = {
  borderRadius: 14,
  minHeight: 52,
  borderColor: colors.palette.primary500,
  borderWidth: 1.5,
  backgroundColor: "transparent",
}

const $registerButtonText: TextStyle = {
  fontSize: 17,
  color: colors.palette.primary700,
}
