import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { Alert, ImageStyle, TextInput, TextStyle, ViewStyle, Image, ActivityIndicator, View } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated"
import { AppStackScreenProps } from "app/navigators"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "app/components"
import { FloatingBubbles } from "app/components/FloatingBubbles"
import { spacing, colors } from "app/theme"
import axios from "app/utils/axios"
import { useAuthStore } from "app/store"

const welcomeLogo = require("../../assets/images/logo.png")

interface RegisterScreenProps extends AppStackScreenProps<"Register"> {}

export const RegisterScreen: FC<RegisterScreenProps> = function RegisterScreen(_props) {
  const registerPasswordInput = useRef<TextInput>(null)
  const registerUsernameInput = useRef<TextInput>(null)

  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isUsernameTaken, setIsUsernameTaken] = useState(false)
  const { navigation } = _props

  const {
    setAuthToken,
    setRefreshToken,
    distributeAuthToken,
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
      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterUsername("")
    }
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }))

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }))

  const emailError = isSubmitted ? registerEmailValidationError() : ""
  const usernameError = isSubmitted ? registerUsernameValidationError() : ""
  const passwordError = isSubmitted ? registerPasswordValidationError() : ""

  function registerEmailValidationError() {
    if (registerEmail.length === 0) return "can't be blank"
    if (registerEmail.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) return "must be a valid email address"
    return ""
  }

  function registerUsernameValidationError() {
    if (registerUsername.length === 0) return "can't be blank"
    if (registerUsername.length < 5) return "must be at least 5 characters"
    return ""
  }

  function registerPasswordValidationError() {
    if (registerPassword.length === 0) return "can't be blank"
    if (registerPassword.length < 6) return "must be at least 6 characters"
    return ""
  }

  function checkUsername() {
    return axios.post(`/account/isUsernameAvailable`, { username: registerUsername })
  }

  function register() {
    setIsSubmitted(true)
    if (registerEmailValidationError()) return
    if (registerUsernameValidationError()) return
    if (registerPasswordValidationError()) return
    setIsLoading(true)
    checkUsername()
      .then((res) => {
        if (!res.data.isAvailable) {
          setIsUsernameTaken(true)
          setIsLoading(false)
          throw new Error("Username is not available")
        } else {
          axios
            .post("/account/register", {
              email: registerEmail,
              username: registerUsername,
              password: registerPassword,
            })
            .then((res) => {
              setIsSubmitted(false)
              setRegisterPassword("")
              setRegisterUsername("")
              setRegisterEmail("")
              setAuthToken(res.data.user.token)
              setRefreshToken(res.data.user.refreshToken)
              setUserId(res.data.user.userId)
              setIsValidated(true)
              distributeAuthToken()
              setIsLoading(false)
            })
            .catch((err) => {
              setIsLoading(false)
              Alert.alert("Error", "An error occurred while registering")
            })
        }
      })
      .catch((err) => {
        setIsLoading(false)
        Alert.alert("Error", "An error occurred while checking username availability")
      })
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
          <Text testID="register-heading" text="Create Account" preset="heading" style={$heading} />
          <Text
            text="The start of a beautiful laundry relationship"
            style={$subheading}
          />

          {isLoading && <ActivityIndicator style={$loader} color={colors.palette.primary600} />}

          <TextField
            value={registerEmail}
            onChangeText={setRegisterEmail}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email"
            placeholder="Enter your email"
            helper={emailError}
            status={emailError ? "error" : undefined}
            onSubmitEditing={() => registerUsernameInput.current?.focus()}
          />

          <TextField
            ref={registerUsernameInput}
            value={registerUsername}
            onChangeText={setRegisterUsername}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect={false}
            keyboardType="default"
            label="Username"
            placeholder="Choose a username"
            helper={usernameError}
            secondHelper={isUsernameTaken ? "username is taken" : ""}
            status={usernameError ? "error" : isUsernameTaken ? "error" : undefined}
            onSubmitEditing={() => registerPasswordInput.current?.focus()}
          />

          <TextField
            ref={registerPasswordInput}
            value={registerPassword}
            onChangeText={setRegisterPassword}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            secureTextEntry={isAuthPasswordHidden}
            label="Password"
            placeholder="Create a password"
            onSubmitEditing={register}
            helper={passwordError}
            status={passwordError ? "error" : undefined}
            RightAccessory={PasswordRightAccessory}
          />

          <Button
            testID="register-button"
            text="Create Account"
            style={$primaryButton}
            textStyle={$primaryButtonText}
            preset="primary"
            onPress={register}
          />

          <View style={$divider}>
            <View style={$dividerLine} />
            <Text text="or" style={$dividerText} />
            <View style={$dividerLine} />
          </View>

          <Button
            testID="back-to-login-button"
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
