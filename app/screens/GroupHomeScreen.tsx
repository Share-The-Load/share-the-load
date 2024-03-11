import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Image, TextStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Card, Icon, Screen, Text } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { useHeader } from "app/utils/useHeader"

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
        console.log(`❗️❗️❗️ members`, yourGroup?.members[1])
        console.log("Group Screen loaded")
      })
    return () => console.log("ProfileScreen unmounted")
  }, [])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Image
        source={avatar}
        style={{ width: "100%", height: 50, borderRadius: 10, alignSelf: "center" }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text preset="heading" style={$title} text={yourGroup?.name || "No group"} />
        <Icon
          style={{
            alignContent: "flex-end",
            flexDirection: "row",
            alignSelf: "flex-end",
          }}
          icon="settings"
          onPress={() => console.log("Settings")}
        />
      </View>
      <Text style={$sloganText} text={yourGroup?.slogan} />
      <Text style={$totalLoads} text={`${yourGroup?.totalLoads} Total Loads Shared`} />

      <Text preset="subheading" text="Members" style={{ marginBottom: spacing.sm }} />

      {yourGroup?.members.map((member) => (
        <Card
          key={member?.user_id}
          heading={member?.username}
          content={`${member.profileTitle}`}
          footer={`${member?.loads} loads shared`}
          style={{
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: spacing.xxs,
          }}
          LeftComponent={
            <Image
              source={avatar}
              style={{ width: 60, height: 60, borderRadius: 20, marginEnd: spacing.xs }}
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

      <View style={$buttonContainer}>
        <Button preset="secondary" style={$button} text="Leave Group" onPress={logout} />
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
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

const $totalLoads: TextStyle = {
  marginBottom: spacing.xl,
  fontSize: 24,
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}

const $buttonContainer: ViewStyle = {
  marginVertical: spacing.md,
}
