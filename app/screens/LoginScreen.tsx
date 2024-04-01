import { observer } from "mobx-react-lite"
import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"

import { ImageStyle, TextInput, TextStyle, ViewStyle, Image, ActivityIndicator } from "react-native"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "../components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import axios from "app/utils/axios"
const welcomeLogo = require("../../assets/images/logo.png")

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen(_props) {
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
    authenticationStore: {
      setAuthToken,
      setRefreshToken,
      distributeAuthToken,
      setUserGroupId,
      setUserId,
      setIsValidated,
    },
  } = useStores()

  useEffect(() => {
    // Return a "cleanup" function that React will run when the component unmounts
    return () => {
      setAuthPassword("")
      setAuthEmailUsername("")
    }
  }, [])

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
        //if the user has registered but hasn't joined a group yet
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
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />

      <Text testID="login-heading" tx="loginScreen.signIn" preset="heading" style={$signIn} />
      <Text tx="loginScreen.enterDetails" preset="subheading" style={$enterDetails} />
      <Text tx="loginScreen.registerDetails" preset="subheading" style={$registerDetails} />
      <ActivityIndicator animating={isLoading} />

      <TextField
        value={authEmailUsername}
        onChangeText={setAuthEmailUsername}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        labelTx="loginScreen.emailFieldLabel"
        placeholderTx="loginScreen.emailFieldPlaceholder"
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
        labelTx="loginScreen.passwordFieldLabel"
        placeholderTx="loginScreen.passwordFieldPlaceholder"
        helper={errorPassword}
        status={errorPassword ? "error" : undefined}
        onSubmitEditing={login}
        RightAccessory={PasswordRightAccessory}
      />

      {loginError && <Text text={loginError} size="sm" weight="light" style={$hint} />}

      <Button
        testID="login-button"
        tx="loginScreen.tapToSignIn"
        style={$tapButton}
        preset="default"
        onPress={login}
      />
      <Button
        testID="register-button"
        tx="loginScreen.tapToRegister"
        style={$registerButton}
        preset="primary"
        onPress={register}
      />
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
}

const $signIn: TextStyle = {
  marginBottom: spacing.sm,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.sm,
}

const $registerDetails: TextStyle = {
  marginBottom: spacing.lg,
  color: colors.palette.neutral400,
  fontSize: 16,
}

const $hint: TextStyle = {
  color: colors.error,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
}

const $registerButton: ViewStyle = {
  marginTop: spacing.xs,
}

const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xl,
}
