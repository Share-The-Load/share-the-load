import React, { FC, useCallback, useState } from "react";
import {
  View,
  ViewStyle,
  Image,
  TextStyle,
  Alert,
  ScrollView,
  Share,
} from "react-native";
import { AppStackScreenProps } from "app/navigators";
import {
  AvatarSelect,
  Button,
  Card,
  DataLoader,
  Icon,
  Screen,
  Text,
  TextField,
  Toggle,
} from "app/components";
import { useAuthStore } from "app/store";
import { api } from "app/services/api";
import { colors, spacing } from "app/theme";
import { GROUPS, getAvatarImage, getGroupImage } from "app/constants/images";
import { Titles } from "app/constants/titles";
import Modal from "react-native-modal";
import type { Group } from "app/services/api/api.types";

const MAX_GROUP_NAME_LENGTH = 25;

function getMemberTitle(loads: number) {
  if (loads < 1) return "No Load Joe";
  const title = Titles.find((t) => loads < t.loads)?.title;
  return title || Titles[Titles.length - 1].title;
}

interface GroupHomeScreenProps extends AppStackScreenProps<"GroupHome"> {}

export const GroupHomeScreen: FC<GroupHomeScreenProps> =
  function GroupHomeScreen() {
    const { userGroupId, userId, setUserGroupId, distributeAuthToken } =
      useAuthStore();

    const [isEditing, setIsEditing] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [passcode, setPasscode] = useState("");
    const [usePasscode, setUsePasscode] = useState(false);
    const [slogan, setSlogan] = useState("");
    const [avatar, setAvatar] = useState(1);

    const groupNameError = createGroupNameValidation();

    function createGroupNameValidation() {
      if (groupName.length === 0) return "can't be blank";
      if (groupName.length < 6) return "must be at least 6 characters";
      if (groupName.length > MAX_GROUP_NAME_LENGTH)
        return `can't be more than ${MAX_GROUP_NAME_LENGTH} characters`;
      return "";
    }

    const fetchGroupDetails = useCallback(async (): Promise<Group> => {
      distributeAuthToken();
      const response = await api.getGroupDetails(userGroupId);
      if (response.kind === "ok" && response.group) {
        setGroupName(response.group.name);
        setSlogan(response.group.slogan);
        setAvatar(response.group.avatar_id);
        return response.group;
      }
      throw new Error("Failed to load group details");
    }, [userGroupId]);

    return (
      <DataLoader queryFn={fetchGroupDetails} loadingMessage="Loading group...">
        {(yourGroup, refetch) => {
          function removeMemberFunction(memberId: number | undefined) {
            Alert.alert(
              "Remove Member",
              "Leave this launderer to the wolves?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Remove",
                  onPress: () => {
                    api
                      .removeMember(memberId)
                      .then(() => refetch())
                      .catch((e) => console.log(e));
                  },
                },
              ],
            );
          }

          function leaveGroupFunction() {
            const transferMember =
              yourGroup.members.length > 1 ? yourGroup.members[1] : null;

            Alert.alert(
              "Leave Group",
              "Are you sure? I sense dirty clothes in your future...",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Leave",
                  onPress: async () => {
                    if (
                      yourGroup.owner_id === userId &&
                      yourGroup.members.length > 1 &&
                      transferMember
                    ) {
                      Alert.alert(
                        "Group ownership",
                        `You are the owner of this group. Group ownership will pass to ${transferMember.username}`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Leave",
                            onPress: () => {
                              api
                                .leaveGroup()
                                .then(() => setUserGroupId(undefined))
                                .catch((e) => console.log(e));
                            },
                          },
                        ],
                      );
                    } else {
                      api
                        .leaveGroup()
                        .then(() => setUserGroupId(undefined))
                        .catch((e) => console.log(e));
                    }
                  },
                },
              ],
            );
          }

          function fetchNewSloganFunction() {
            api
              .fetchNewSlogan()
              .then((response) => {
                if (response.kind === "ok" && response.slogan) {
                  setSlogan(response.slogan);
                }
              })
              .catch((e) => console.log(e));
          }

          function submitEditGroup() {
            api
              .editGroup(groupName, slogan, avatar, passcode)
              .then(() => refetch())
              .catch((e) => console.log(e));
          }

          function disablePasscode() {
            Alert.alert(
              "Disable Passcode",
              "Are you sure you want to disable the passcode?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Disable",
                  onPress: () => {
                    setPasscode("");
                    setUsePasscode(false);
                    api.removeGroupPasscode().then(() => refetch());
                  },
                },
              ],
            );
          }

          async function shareInviteLink() {
            try {
              distributeAuthToken();
              const response = await api.getInviteCode(yourGroup.group_id);
              if (response.kind === "ok") {
                const url = `share-the-load://invite/${response.inviteCode}`;
                await Share.share({
                  message: `Join my group "${yourGroup.name}" on Share The Load! ${url}`,
                });
              } else {
                Alert.alert("Error", "Could not generate invite link");
              }
            } catch (e) {
              console.log(e);
            }
          }

          return (
            <Screen
              preset="scroll"
              safeAreaEdges={["top"]}
              contentContainerStyle={$container}
            >
              {/* Header Banner */}
              <View style={$headerCard}>
                <Image
                  source={getGroupImage(yourGroup.avatar_id)}
                  style={$bannerImage}
                />
                <View style={$headerOverlay}>
                  <View style={$headerRow}>
                    <Text
                      preset="heading"
                      style={$headerTitle}
                      text={yourGroup.name}
                    />
                    {yourGroup.owner_id === userId && (
                      <Icon
                        icon="settings"
                        color={colors.palette.neutral500}
                        onPress={() => setIsEditing(!isEditing)}
                      />
                    )}
                  </View>
                  <Text style={$sloganText} text={yourGroup.slogan} />
                </View>
              </View>

              {/* Stats */}
              <View style={$statsCard}>
                <View style={$statItem}>
                  <Text style={$statNumber} text={`${yourGroup.totalLoads}`} />
                  <Text style={$statLabel} text="Total Loads" />
                </View>
                <View style={$statDivider} />
                <View style={$statItem}>
                  <Text
                    style={$statNumber}
                    text={`${yourGroup.members.length}`}
                  />
                  <Text style={$statLabel} text="Members" />
                </View>
              </View>

              {/* Share Invite Link */}
              <Button
                preset="default"
                text="Share Invite Link"
                style={$shareButton}
                onPress={shareInviteLink}
              />

              {/* Members */}
              <Text preset="formLabel" text="MEMBERS" style={$sectionLabel} />
              <View style={$membersDivider} />

              {yourGroup.members.map((member) => (
                <Card
                  key={member.user_id}
                  heading={member.username}
                  content={getMemberTitle(member.loads)}
                  footer={`${member.loads} loads shared`}
                  style={$memberCard}
                  LeftComponent={
                    <Image
                      source={getAvatarImage(member.avatar_id)}
                      style={$memberAvatar}
                    />
                  }
                  RightComponent={
                    <View style={$memberAction}>
                      {member.isOwner ? (
                        <View style={$ownerBadge}>
                          <Text style={$ownerBadgeText} text="Owner" />
                        </View>
                      ) : (
                        yourGroup.owner_id === userId && (
                          <Icon
                            icon="user_minus"
                            size={26}
                            color={colors.palette.angry500}
                            onPress={() => removeMemberFunction(member.user_id)}
                          />
                        )
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
                isVisible={isEditing}
                backdropColor={colors.palette.neutral200}
                backdropOpacity={1}
                scrollHorizontal={true}
                coverScreen={true}
              >
                <ScrollView style={$modalScroll}>
                  <Text
                    preset="heading"
                    style={$modalTitle}
                    text="Edit Group"
                  />

                  <View style={$modalSection}>
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
                      containerStyle={$modalField}
                    />
                    <TextField
                      value={slogan}
                      onChangeText={setSlogan}
                      editable={false}
                      label="Group Slogan"
                      containerStyle={$modalField}
                      RightAccessory={() => (
                        <Button
                          style={$changeSloganButton}
                          text="Change"
                          preset="small"
                          onPress={fetchNewSloganFunction}
                        />
                      )}
                    />
                  </View>

                  <View style={$modalSection}>
                    <Text
                      preset="formLabel"
                      style={$avatarLabel}
                      text="Group Avatar"
                    />
                    <View style={$avatarGrid}>
                      {GROUPS.map((group, index) => (
                        <AvatarSelect
                          key={group}
                          avatar={group}
                          selected={index + 1 === avatar}
                          onPress={() => setAvatar(index + 1)}
                        />
                      ))}
                    </View>
                  </View>

                  <View style={$modalSection}>
                    {yourGroup.hasPasscode ? (
                      <>
                        <Toggle
                          value={true}
                          onValueChange={disablePasscode}
                          variant="switch"
                          label="Use a passcode?"
                          labelPosition="left"
                          containerStyle={$modalField}
                        />
                        <TextField
                          value={passcode}
                          onChangeText={setPasscode}
                          containerStyle={$modalField}
                          autoCapitalize="none"
                          autoComplete="off"
                          autoCorrect={false}
                          keyboardType="default"
                          label="Change Passcode"
                          placeholder="secretCode123"
                        />
                      </>
                    ) : (
                      <>
                        <Toggle
                          value={usePasscode}
                          onValueChange={() => setUsePasscode(!usePasscode)}
                          variant="switch"
                          label="Add a passcode?"
                          labelPosition="left"
                          containerStyle={$modalField}
                        />
                        {usePasscode && (
                          <TextField
                            value={passcode}
                            onChangeText={setPasscode}
                            containerStyle={$modalField}
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
                  </View>

                  <View style={$modalButtons}>
                    <Button
                      preset="primary"
                      text="Save"
                      style={$button}
                      onPress={() => {
                        submitEditGroup();
                        setIsEditing(!isEditing);
                      }}
                      disabledStyle={$disabledButton}
                      disabled={groupNameError !== ""}
                    />
                    <Button
                      preset="default"
                      text="Cancel"
                      onPress={() => {
                        setIsEditing(!isEditing);
                        setGroupName(yourGroup.name || "");
                        setSlogan(yourGroup.slogan || "");
                        setAvatar(yourGroup.avatar_id || 1);
                        setPasscode("");
                        setUsePasscode(false);
                      }}
                    />
                  </View>
                </ScrollView>
              </Modal>
            </Screen>
          );
        }}
      </DataLoader>
    );
  };

const $container: ViewStyle = {
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
};

const $headerCard: ViewStyle = {
  borderRadius: 14,
  overflow: "hidden",
  backgroundColor: colors.palette.neutral100,
  marginBottom: spacing.md,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
};

const $bannerImage: any = {
  width: "100%",
  height: 110,
};

const $headerOverlay: ViewStyle = {
  padding: spacing.md,
};

const $headerRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xxs,
};

const $headerTitle: TextStyle = {
  flex: 1,
  marginRight: spacing.sm,
};

const $sloganText: TextStyle = {
  color: colors.textDim,
  fontStyle: "italic",
  fontSize: 15,
};

const $statsCard: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.lg,
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
};

const $statItem: ViewStyle = {
  flex: 1,
  alignItems: "center",
};

const $statNumber: TextStyle = {
  fontSize: 28,
  lineHeight: 36,
  fontWeight: "700",
  color: colors.palette.primary700,
};

const $statLabel: TextStyle = {
  fontSize: 13,
  color: colors.textDim,
  marginTop: spacing.xxxs,
};

const $statDivider: ViewStyle = {
  width: 1,
  height: 36,
  backgroundColor: colors.separator,
};

const $shareButton: ViewStyle = {
  marginBottom: spacing.lg,
};

const $sectionLabel: TextStyle = {
  color: colors.textDim,
  fontSize: 13,
  letterSpacing: 1,
  marginBottom: spacing.xs,
};

const $membersDivider: ViewStyle = {
  height: 1,
  backgroundColor: colors.separator,
  marginBottom: spacing.sm,
};

const $memberCard: ViewStyle = {
  alignContent: "center",
  justifyContent: "center",
  alignItems: "center",
  marginVertical: spacing.xxs,
};

const $memberAvatar: any = {
  width: 56,
  height: 56,
  borderRadius: 10,
  marginEnd: spacing.xs,
};

const $memberAction: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
};

const $ownerBadge: ViewStyle = {
  backgroundColor: colors.palette.primary50,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
  borderRadius: 12,
};

const $ownerBadgeText: TextStyle = {
  color: colors.palette.primary700,
  fontSize: 12,
  fontWeight: "600",
};

const $button: ViewStyle = {
  marginBottom: spacing.xs,
};

const $buttonContainer: ViewStyle = {
  marginVertical: spacing.md,
};

const $modalScroll: ViewStyle = {
  marginTop: spacing.xxxl,
};

const $modalTitle: TextStyle = {
  marginBottom: spacing.lg,
};

const $modalSection: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.md,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
};

const $modalField: ViewStyle = {
  marginBottom: spacing.md,
};

const $changeSloganButton: ViewStyle = {
  alignSelf: "center",
};

const $avatarLabel: TextStyle = {
  marginBottom: spacing.md,
};

const $avatarGrid: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignContent: "flex-start",
  flexWrap: "wrap",
};

const $modalButtons: ViewStyle = {
  marginVertical: spacing.md,
};

const $disabledButton: ViewStyle = {
  backgroundColor: colors.palette.neutral400,
};
