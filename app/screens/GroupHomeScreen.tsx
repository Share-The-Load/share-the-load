import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Image, TextStyle, Alert, Modal } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Card, Icon, Screen, Text, TextField, Toggle } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"

const MAX_GROUP_NAME_LENGTH = 25

const avatar = require("../../assets/images/app-icon-all.png")
interface GroupHomeScreenProps extends AppStackScreenProps<"GroupHome"> {}

export const GroupHomeScreen: FC<GroupHomeScreenProps> = observer(function GroupHomeScreen() {
  const {
    authenticationStore: { userGroupId, userId, setUserGroupId },
    groupStore: { getGroupDetails, leaveGroup, removeMember, fetchNewSlogan, yourGroup },
  } = useStores()

  const [isEditing, setIsEditing] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [passcode, setPasscode] = useState("")
  const [usePasscode, setUsePasscode] = useState(false)
  const [slogan, setSlogan] = useState("")

  const groupNameError = createGroupNameValidation()

  function createGroupNameValidation() {
    if (groupName.length === 0) return "can't be blank"
    if (groupName.length < 6) return "must be at least 6 characters"
    if (groupName.length > MAX_GROUP_NAME_LENGTH)
      return `can't be more than ${MAX_GROUP_NAME_LENGTH} characters`
    return ""
  }

  useEffect(() => {
    getGroupDetails(userGroupId)
      .catch((e) => console.log(e))
      .then(() => {
        setGroupName(yourGroup?.name || "")
        console.log(`❗️❗️❗️ user`, yourGroup)
        console.log(`❗️❗️❗️ members`, yourGroup?.members[1])
        setSlogan(yourGroup?.slogan || "")
        console.log("Group Screen loaded")
      })
    return () => console.log("ProfileScreen unmounted")
  }, [])

  async function removeMemberFunction(memberId: number) {
    await Alert.alert("Remove Member", "Leave this launderer to the wolves?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        onPress: () => {
          removeMember(memberId).catch((e) => console.log(e))
        },
      },
    ])
  }

  async function leaveGroupFunction() {
    await Alert.alert("Leave Group", "Are you sure? I sense dirty clothes in your future...", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Leave",
        onPress: async () => {
          console.log("Leave group")
          leaveGroup()
            .then(() => setUserGroupId(undefined))
            .catch((e) => console.log(e))
        },
      },
    ])
  }

  function fetchNewSloganFunction() {
    fetchNewSlogan()
      .catch((e) => console.log(e))
      .then((newSlogan: string | void | undefined) => {
        if (typeof newSlogan === "string") {
          setSlogan(newSlogan)
        }
      })
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Image
        source={avatar}
        style={{ width: "100%", height: 80, borderRadius: 10, alignSelf: "center" }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text preset="heading" style={$title} text={yourGroup?.name || "No group"} />
        {yourGroup?.owner_id === userId && (
          <Icon
            style={{
              alignContent: "flex-end",
              flexDirection: "row",
              alignSelf: "flex-end",
            }}
            icon="settings"
            onPress={() => setIsEditing(!isEditing)}
          />
        )}
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
              {member?.isOwner ? (
                <Text style={{ marginTop: spacing.xxs, marginRight: spacing.xs }} text={`Owner`} />
              ) : (
                <Icon
                  style={{ marginTop: spacing.xxs, marginRight: spacing.xs }}
                  icon="user_minus"
                  size={30}
                  onPress={() => removeMemberFunction(member?.user_id)}
                />
              )}
            </View>
          }
        />
      ))}

      <View style={$buttonContainer}>
        <Button
          preset="secondary"
          style={$button}
          text="Leave Group"
          onPress={leaveGroupFunction}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditing}
        onRequestClose={() => {
          console.log("Modal has been closed")
        }}
      >
        <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "flex-start" }}>
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              paddingVertical: 100,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text preset="subheading" style={{ marginBottom: 20 }} text="Edit Group" />

            <TextField
              value={groupName}
              onChangeText={setGroupName}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              keyboardType="default"
              label="Group Name"
              placeholder="Super Cleaners"
              helper={groupNameError}
              status={groupNameError ? "error" : undefined}
              containerStyle={{ marginBottom: spacing.md }}
            />
            <TextField
              value={slogan}
              onChangeText={setSlogan}
              editable={false}
              label="Group Slogan"
              containerStyle={{ marginBottom: spacing.md }}
              RightAccessory={() => (
                <Button
                  style={{ alignSelf: "center" }}
                  text="Change"
                  preset="small"
                  onPress={fetchNewSloganFunction}
                />
              )}
            />
            {yourGroup?.hasPasscode ? (
              <>
                <TextField
                  value={passcode}
                  onChangeText={setPasscode}
                  containerStyle={{ marginBottom: spacing.md }}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  keyboardType="default"
                  label="Passcode"
                  placeholder="secretCode123"
                  helper={passcode ? "" : "Passcode is required"}
                  status={passcode === "" ? "error" : undefined}
                />
                <Button preset="secondary" text="Remove Passcode" style={$button} />
                <Button preset="secondary" text="Change Passcode" style={$button} />
              </>
            ) : (
              <>
                <Toggle
                  value={usePasscode}
                  onValueChange={() => setUsePasscode(!usePasscode)}
                  variant="switch"
                  label="Add a passcode?"
                  labelPosition="left"
                  containerStyle={{ marginBottom: spacing.md }}
                />
                {usePasscode && (
                  <TextField
                    value={passcode}
                    onChangeText={setPasscode}
                    containerStyle={{ marginBottom: spacing.md }}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    keyboardType="default"
                    label="Passcode"
                    placeholder="secretCode123"
                    helper={passcode ? "" : "Passcode is required"}
                    status={passcode === "" ? "error" : undefined}
                  />
                )}
              </>
            )}

            <View style={$buttonContainer}>
              <Button
                preset="primary"
                text="Save"
                style={$button}
                onPress={() => {
                  console.log("Modal has been closed.")
                  setIsEditing(!isEditing)
                }}
                disabledStyle={{ backgroundColor: colors.palette.neutral400 }}
                disabled={groupNameError !== ""}
              />
              <Button
                preset="default"
                text="Cancel"
                onPress={() => {
                  console.log("Modal has been closed.")
                  setIsEditing(!isEditing)
                  setGroupName(yourGroup?.name || "")
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
