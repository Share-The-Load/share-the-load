import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps, goBack } from "app/navigators"
import { Screen, Text, TextField, Button } from "app/components"
import { spacing } from "app/theme"
import { useHeader } from "app/utils/useHeader"
import axios from "app/utils/axios"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface ForgotPasswordScreenProps extends AppStackScreenProps<"ForgotPassword"> {}

export const ForgotPasswordScreen: FC<ForgotPasswordScreenProps> = observer(
  function ForgotPasswordScreen() {
    const [emailOrUsername, setemailOrUsername] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const emailUsernameError = isSubmitted ? validationError() : ""

    function validationError() {
      if (emailOrUsername.length === 0) return "can't be blank"
      if (emailOrUsername.length < 5) return "must be at least 5 characters"
      return ""
    }

    function forgotPassword() {
      setIsSubmitted(true)
      if (validationError()) {
        return
      }

      axios
        .post("/account/forgot-password", { emailUsername: emailOrUsername })
        .then(() => {
          Alert.alert("Success", "Temporary password has been sent to your email")
        })
        .catch((error: any) => {
          Alert.alert("Error", "An error occurred. Please try again later")
          console.log(error)
        })
    }

    useHeader(
      {
        leftText: "Sign In",
        onLeftPress: goBack,
      },
      [goBack],
    )

    return (
      <Screen
        preset="auto"
        contentContainerStyle={$screenContentContainer}
        safeAreaEdges={["bottom"]}
      >
        <Text text="Forgot Password" preset="heading" style={$signIn} />
        <Text
          text="Passwords are like socks.... sometimes they get lost"
          preset="subheading"
          style={$enterDetails}
        />

        <TextField
          value={emailOrUsername}
          onChangeText={setemailOrUsername}
          containerStyle={$textField}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          label="Email/Username"
          placeholder="Enter your email or username"
          helper={emailUsernameError}
          status={emailUsernameError ? "error" : undefined}
        />

        <Button
          text="Get Temporary Password"
          style={$tapButton}
          preset="primary"
          onPress={forgotPassword}
        />
      </Screen>
    )
  },
)

const $screenContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
}

const $signIn: TextStyle = {
  marginBottom: spacing.sm,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
}
