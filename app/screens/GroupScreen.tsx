import React, { FC, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, TextStyle, ViewStyle, TextInput, ActivityIndicator } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, GroupItem, Screen, Text, TextField, Toggle } from "app/components"
import { spacing } from "app/theme"
import { Group, useStores } from "app/models"

const MAX_GROUP_NAME_LENGTH = 25

interface GroupScreenProps extends AppStackScreenProps<"Group"> {}

export const GroupScreen: FC<GroupScreenProps> = observer(function GroupScreen(_props) {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const { groupStore, authenticationStore } = useStores()
  const passcodeInput = useRef<TextInput>(null)

  const [groupName, setGroupName] = useState("")
  const [searchGroupName, setSearchGroupName] = useState("")
  const [passcode, setPasscode] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [usePasscode, setUsePasscode] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [mode, setMode] = useState(_props.route.params?.mode || "find")

  const groupNameError = hasSubmitted ? createGroupNameValidation() : ""

  function createGroupNameValidation() {
    if (groupName.length === 0) return "can't be blank"
    if (groupName.length < 6) return "must be at least 6 characters"
    if (groupName.length > MAX_GROUP_NAME_LENGTH)
      return `can't be more than ${MAX_GROUP_NAME_LENGTH} characters`
    return ""
  }

  const [isLoading, setIsLoading] = React.useState(false)

  function search() {
    setIsLoading(true)
    groupStore
      .searchGroupsByName(searchGroupName)
      .catch((e) => console.log(e))
      .finally(() => {
        setIsLoading(false)
        setHasSearched(true)
      })
  }

  function createGroup() {
    console.log("Create group")
    setHasSubmitted(true)
    if (createGroupNameValidation() != "" || (usePasscode && !passcode)) {
      return
    }
    setIsLoading(true)
    groupStore
      .createGroup(groupName, passcode)
      .then(() => {
        authenticationStore.setUserGroupId(groupStore.yourGroup?.group_id)
      })
      .catch((e) => {
        Alert.alert(
          `This is awkward... ${groupName} is taken.`,
          `You must be cut from the same clean cloth`,
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  async function joinGroup(group: Group) {
    await Alert.alert("Join Group", "Are you sure you want to launder with this group?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Join",
        onPress: async () => {
          if (group.hasPasscode) {
            await Alert.prompt(
              "Passcode",
              "Enter the passcode to join the group",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Join",
                  onPress: async (passcode) => {
                    setIsLoading(true)
                    groupStore
                      .joinGroup(group.group_id, passcode || "")
                      .then(() => {
                        setIsLoading(false)
                        authenticationStore.setUserGroupId(groupStore.yourGroup?.group_id)
                      })
                      .catch((e) => {
                        Alert.alert("Error", "Wrong Passcode!")
                      })
                      .finally(() => {
                        setIsLoading(false)
                      })
                  },
                },
              ],
              "secure-text",
            )
          } else {
            setIsLoading(true)
            groupStore
              .joinGroup(group.group_id, "")
              .then(() => {
                setIsLoading(false)
                authenticationStore.setUserGroupId(groupStore.yourGroup?.group_id)
              })
              .catch((e) => {
                Alert.alert("Error", "Can't Join!")
              })
              .finally(() => {
                setIsLoading(false)
              })
          }
        },
      },
    ])
  }

  function changeMode() {
    setMode(mode === "find" ? "create" : "find")
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text style={$title} preset="heading" text="Group" />
      <Text
        text="History is written by the ones with clean clothes"
        preset="subheading"
        style={$enterDetails}
      />

      {mode === "find" ? (
        <>
          <TextField
            value={searchGroupName}
            onChangeText={setSearchGroupName}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            keyboardType="default"
            label="Group Name"
            placeholder="Super Cleaners"
            onSubmitEditing={search}
          />
          <Button preset="default" text="Search" style={$button} onPress={search} />
          <Button preset="primary" text="Create Group" style={$button} onPress={changeMode} />

          <Text preset="heading" text="Groups Found" style={$bottomTitle} />

          <ActivityIndicator animating={isLoading} />
          {groupStore.hasGroups ? (
            <>
              {groupStore.searchedGroups.map((group) => (
                <GroupItem
                  key={group.group_id}
                  text={group?.name}
                  bottomSeparator={true}
                  hasPasscode={group?.hasPasscode}
                  membersCount={group?.numberOfMembers}
                  owner={group?.ownerName}
                  avatarId={group?.avatar_id}
                  onPress={() => joinGroup(group)}
                />
              ))}
            </>
          ) : hasSearched && !groupStore.hasGroups ? (
            <Text preset="subheading" text="No groups found!" />
          ) : null}
        </>
      ) : (
        // Create Group
        <>
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
            helper={groupNameError}
            status={groupNameError ? "error" : undefined}
            onSubmitEditing={() => passcodeInput.current?.focus()}
          />
          <Toggle
            value={usePasscode}
            onValueChange={() => setUsePasscode(!usePasscode)}
            variant="switch"
            label="Use a passcode?"
            labelPosition="left"
            containerStyle={$toggleStyle}
          />
          {usePasscode && (
            <TextField
              ref={passcodeInput}
              value={passcode}
              onChangeText={setPasscode}
              containerStyle={$textField}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              keyboardType="default"
              label="Passcode"
              placeholder="secretCode123"
              helper={passcode ? "" : "Passcode is required"}
              status={passcode === "" ? "error" : undefined}
              onSubmitEditing={createGroup}
            />
          )}
          <ActivityIndicator animating={isLoading} />

          <Button text="Create Group" style={$button} onPress={createGroup} />
          <Button preset="primary" text="Find Group" style={$button} onPress={changeMode} />
        </>
      )}
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.lg + spacing.xl,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.md,
}

const $bottomTitle: TextStyle = {
  marginBottom: spacing.xxxs,
  marginTop: spacing.xl,
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}

const $toggleStyle: ViewStyle = {
  marginBottom: spacing.md,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.xl,
}
const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}
