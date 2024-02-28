import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, TextInput, TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps, goBack } from "app/navigators"
import { Icon, Screen, Text, TextField, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { useHeader } from "app/utils/useHeader"
import axios from "app/utils/axios"
import { useStores } from "app/models"

// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface RegisterScreenProps extends AppStackScreenProps<"Register"> {}

export const RegisterScreen: FC<RegisterScreenProps> = observer(function RegisterScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const registerPasswordInput = useRef<TextInput>(null)
  const registerUsernameInput = useRef<TextInput>(null)

  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(false)
  const [isUsernameTaken, setIsUsernameTaken] = useState(false)

  const emailError = isSubmitted ? registerEmailValidationError() : ""
  const passwordError = isSubmitted ? registerPasswordValidationError() : ""
  const usernameError = isSubmitted ? registerUsernameValidationError() : ""

  const {
    authenticationStore: { setAuthToken, setRefreshToken, distributeAuthToken, setUserId },
  } = useStores()

  useEffect(() => {
    // Here is where you could fetch credentials from keychain or storage
    // and pre-fill the form fields.
    setRegisterEmail("brettstrouse@gmail.com")
    setRegisterPassword("bandit")

    // Return a "cleanup" function that React will run when the component unmounts
    return () => {
      setRegisterEmail("")
      setRegisterPassword("")
    }
  }, [])

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

  useHeader(
    {
      leftText: "Sign In",
      onLeftPress: goBack,
    },
    [goBack],
  )

  function register() {
    setIsSubmitted(true)
    if (registerEmailValidationError()) return
    if (registerUsernameValidationError()) return
    if (registerPasswordValidationError()) return
    checkUsername()
      .then((res) => {
        if (!res.data.isAvailable) {
          setIsUsernameTaken(true)
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
              distributeAuthToken()
            })
            .catch((err) => {
              Alert.alert("Error", "An error occurred while registering")
            })
        }
      })
      .catch((err) => {
        Alert.alert("Error", "An error occurred while checking username availability")
      })
  }

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["bottom"]}
    >
      <Text testID="login-heading" text="Register" preset="heading" style={$signIn} />
      <Text
        text="The start of a beautiful laundry relationship"
        preset="subheading"
        style={$enterDetails}
      />

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
        placeholder="Usual laundry app username"
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
        labelTx="loginScreen.passwordFieldLabel"
        placeholderTx="loginScreen.passwordFieldPlaceholder"
        onSubmitEditing={register}
        helper={passwordError}
        status={passwordError ? "error" : undefined}
      />

      <Button
        testID="login-button"
        text="Register"
        style={$tapButton}
        preset="primary"
        onPress={register}
      />
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
}

const $signIn: TextStyle = {
  marginBottom: spacing.sm,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.sm,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
}
