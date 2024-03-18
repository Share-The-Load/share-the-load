import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { spacing } from "app/theme"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface LoadsScreenProps extends AppStackScreenProps<"Loads"> {}

export const LoadsScreen: FC<LoadsScreenProps> = observer(function LoadsScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen safeAreaEdges={["top"]} contentContainerStyle={$container} preset="scroll">
      <Text text="Brett" />
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  paddingHorizontal: spacing.lg,
}
