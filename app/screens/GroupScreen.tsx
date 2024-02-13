import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ImageStyle, TextStyle, View, ViewStyle, Image } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { spacing } from "app/theme"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface GroupScreenProps extends AppStackScreenProps<"Group"> {}

export const GroupScreen: FC<GroupScreenProps> = observer(function GroupScreen(_props) {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const [groupName, setGroupName] = useState("")

  // Pull in navigation via hook
  // const navigation = useNavigation()
  const mode = _props.route.params.mode

  function search() {
    console.log("Search for group")
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text style={$title} preset="heading" text="Group" />
      <Text
        text="History is written by the ones with clean clothes"
        preset="subheading"
        style={$enterDetails}
      />

      <TextField
        value={groupName}
        onChangeText={setGroupName}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        keyboardType="default"
        label="Group Name"
        placeholder="Super Cleaners"
        onSubmitEditing={search}
      />
      <Button text="Search" style={$button} onPress={() => console.log("Create Group")} />
    </Screen>
  )
})

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

const $enterDetails: TextStyle = {
  marginBottom: spacing.sm,
}
const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}
