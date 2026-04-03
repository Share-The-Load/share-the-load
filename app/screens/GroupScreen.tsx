import React, { FC, useRef, useState } from "react"
import {
  Alert,
  TextStyle,
  ViewStyle,
  TextInput,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, GroupItem, Screen, Text, TextField, Toggle } from "app/components"
import { colors, spacing } from "app/theme"
import { useAuthStore } from "app/store"
import { api } from "app/services/api"
import type { Group } from "app/services/api/api.types"

const MAX_GROUP_NAME_LENGTH = 25

interface GroupScreenProps extends AppStackScreenProps<"Group"> {}

export const GroupScreen: FC<GroupScreenProps> = function GroupScreen(_props) {
  const { setUserGroupId } = useAuthStore()
  const passcodeInput = useRef<TextInput>(null)

  const [groupName, setGroupName] = useState("")
  const [searchGroupName, setSearchGroupName] = useState("")
  const [passcode, setPasscode] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [usePasscode, setUsePasscode] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [mode, setMode] = useState(_props.route.params?.mode || "find")
  const [searchedGroups, setSearchedGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const groupNameError = hasSubmitted ? createGroupNameValidation() : ""

  function createGroupNameValidation() {
    if (groupName.length === 0) return "can't be blank"
    if (groupName.length < 6) return "must be at least 6 characters"
    if (groupName.length > MAX_GROUP_NAME_LENGTH)
      return `can't be more than ${MAX_GROUP_NAME_LENGTH} characters`
    return ""
  }

  function search() {
    setIsLoading(true)
    api
      .searchGroupsByName(searchGroupName)
      .then((response) => {
        if (response.kind === "ok") {
          setSearchedGroups(response.groups)
        } else {
          setSearchedGroups([])
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setIsLoading(false)
        setHasSearched(true)
      })
  }

  function createGroup() {
    setHasSubmitted(true)
    if (createGroupNameValidation() != "" || (usePasscode && !passcode)) {
      return
    }
    setIsLoading(true)
    api
      .createGroup(groupName, passcode)
      .then((response) => {
        if (response.kind === "ok" && response.group) {
          setUserGroupId(response.group.group_id)
        }
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
                  onPress: async (passcode: string | undefined) => {
                    setIsLoading(true)
                    api
                      .joinGroup(group.group_id, passcode || "")
                      .then((response) => {
                        if (response.kind === "ok" && response.group) {
                          setUserGroupId(response.group.group_id)
                        }
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
            api
              .joinGroup(group.group_id, "")
              .then((response) => {
                if (response.kind === "ok" && response.group) {
                  setUserGroupId(response.group.group_id)
                }
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

  const isFind = mode === "find"

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text style={$title} preset="heading" text="Group" />
      <Text
        text="History is written by the ones with clean clothes"
        preset="subheading"
        style={$subtitle}
      />

      {/* Tab Switcher */}
      <View style={$tabContainer}>
        <TouchableOpacity
          style={[$tab, isFind && $tabActive]}
          onPress={() => setMode("find")}
          activeOpacity={0.7}
        >
          <Text
            text="Find Group"
            style={[$tabText, isFind && $tabTextActive]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[$tab, !isFind && $tabActive]}
          onPress={() => setMode("create")}
          activeOpacity={0.7}
        >
          <Text
            text="Create Group"
            style={[$tabText, !isFind && $tabTextActive]}
          />
        </TouchableOpacity>
      </View>

      {isFind ? (
        <>
          <View style={$section}>
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
            <Button preset="default" text="Search" style={$searchButton} onPress={search} />
          </View>

          <View style={$resultsSection}>
            <Text preset="formLabel" text="RESULTS" style={$resultsLabel} />
            <View style={$resultsDivider} />

            {isLoading ? (
              <ActivityIndicator style={$loader} />
            ) : searchedGroups.length > 0 ? (
              <View style={$resultsList}>
                {searchedGroups.map((group) => (
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
              </View>
            ) : hasSearched ? (
              <View style={$emptyState}>
                <Text
                  preset="subheading"
                  text="No groups found"
                  style={$emptyTitle}
                />
                <Text
                  text="Try a different name or create your own group"
                  style={$emptyHint}
                />
              </View>
            ) : (
              <View style={$emptyState}>
                <Text
                  text="Search for a group to join"
                  style={$emptyHint}
                />
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={$section}>
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
          {isLoading && <ActivityIndicator style={$loader} />}

          <Button text="Create Group" style={$createButton} onPress={createGroup} />
        </View>
      )}
    </Screen>
  )
}

const $container: ViewStyle = {
  paddingTop: spacing.lg + spacing.xl,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.xxs,
}

const $subtitle: TextStyle = {
  marginBottom: spacing.xl,
  color: colors.textDim,
}

const $tabContainer: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.palette.neutral300,
  borderRadius: 10,
  padding: spacing.xxxs,
  marginBottom: spacing.lg,
}

const $tab: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.sm,
  alignItems: "center",
  borderRadius: 8,
}

const $tabActive: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,
  elevation: 2,
}

const $tabText: TextStyle = {
  color: colors.textDim,
  fontSize: 15,
  fontWeight: "500",
}

const $tabTextActive: TextStyle = {
  color: colors.palette.primary700,
  fontWeight: "600",
}

const $section: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.md,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
}

const $searchButton: ViewStyle = {
  marginTop: spacing.xxs,
}

const $createButton: ViewStyle = {
  marginTop: spacing.xs,
}

const $resultsSection: ViewStyle = {
  marginTop: spacing.xs,
}

const $resultsLabel: TextStyle = {
  color: colors.textDim,
  fontSize: 13,
  letterSpacing: 1,
  marginBottom: spacing.xs,
}

const $resultsDivider: ViewStyle = {
  height: 1,
  backgroundColor: colors.separator,
  marginBottom: spacing.sm,
}

const $resultsList: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.sm,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
}

const $emptyState: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.xxl,
}

const $emptyTitle: TextStyle = {
  marginBottom: spacing.xs,
  color: colors.palette.neutral600,
}

const $emptyHint: TextStyle = {
  color: colors.textDim,
  fontSize: 14,
}

const $loader: ViewStyle = {
  marginVertical: spacing.md,
}

const $toggleStyle: ViewStyle = {
  marginBottom: spacing.md,
}

const $textField: ViewStyle = {
  marginBottom: spacing.md,
}
