import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Image, TextStyle, ImageStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, ListItem, Screen, Text } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"

const avatar = require("../../assets/images/app-icon-all.png")
interface GroupHomeScreenProps extends AppStackScreenProps<"GroupHome"> {}

export const GroupHomeScreen: FC<GroupHomeScreenProps> = observer(function GroupHomeScreen() {
  const {
    authenticationStore: { logout, userGroupId },
    groupStore: { getGroupDetails, yourGroup },
  } = useStores()

  useEffect(() => {
    getGroupDetails(userGroupId)
      .catch((e) => console.log(e))
      .then(() => {
        console.log(`❗️❗️❗️ user`, yourGroup)
        console.log("Group Screen loaded")
      })
    return () => console.log("ProfileScreen unmounted")
  }, [])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text preset="heading" style={$title} text={yourGroup?.name || "No group"} />
      <Text style={$sloganText} text={yourGroup?.slogan} />

      <Text preset="subheading" text="Members" style={{ marginBottom: spacing.sm }} />

      {yourGroup?.members.map((member) => (
        <ListItem
          key={member?.user_id}
          text={member?.username}
          bottomSeparator={true}
          style={{ alignContent: "center", justifyContent: "center", alignItems: "center" }}
          LeftComponent={
            <Image
              source={avatar}
              style={{ width: 40, height: 40, borderRadius: 20, marginEnd: spacing.xs }}
            />
          }
          RightComponent={
            <View
              style={{
                justifyContent: "center",
                alignItems: "flex-start",
                alignSelf: "center",
                flexDirection: "row",
              }}
            >
              {member?.isOwner && (
                <Text style={{ marginTop: spacing.xxs, marginLeft: spacing.xs }} text={`Owner`} />
              )}
            </View>
          }
        />
      ))}
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.xxs,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.xs,
}

const $sloganText: TextStyle = {
  color: colors.textDim,
  fontStyle: "italic",
  fontSize: 16,
  marginBottom: spacing.xl,
}
