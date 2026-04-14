import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageStyle,
  ScrollView,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { AppStackScreenProps } from "app/navigators"
import { AvatarSelect, Button, GroupItem, Text, TextField, Toggle } from "app/components"
import { FloatingBubbles } from "app/components/FloatingBubbles"
import { AVATARS } from "app/constants/images"
import { colors, spacing, typography } from "app/theme"
import { useAuthStore } from "app/store"
import { api } from "app/services/api"
import type { Group } from "app/services/api/api.types"

const LAUNDRY_ADJECTIVES = [
  "Fresh", "Fluffy", "Clean", "Crisp", "Soft", "Sudsy", "Sparkling",
  "Squeaky", "Pristine", "Spotless", "Breezy", "Snugly", "Cozy",
  "Silky", "Steamy", "Zippy", "Bubbly", "Minty", "Toasty", "Zesty",
]

const LAUNDRY_NOUNS = [
  "Sock", "Fold", "Spin", "Lint", "Press", "Suds", "Rinse",
  "Tumble", "Fluff", "Starch", "Dryer", "Washer", "Hanger",
  "Iron", "Basket", "Sheet", "Towel", "Fabric", "Pleat", "Crease",
]

const LAUNDRY_TITLES = [
  "Hero", "Master", "Star", "Pro", "Ninja", "Wizard",
  "Legend", "Boss", "Ace", "Guru", "Chief", "Champ",
]

function generateLaundryUsername(): string {
  const adj = LAUNDRY_ADJECTIVES[Math.floor(Math.random() * LAUNDRY_ADJECTIVES.length)]
  const noun = LAUNDRY_NOUNS[Math.floor(Math.random() * LAUNDRY_NOUNS.length)]
  const title = LAUNDRY_TITLES[Math.floor(Math.random() * LAUNDRY_TITLES.length)]
  const num = Math.floor(Math.random() * 99) + 1
  return `${adj}${noun}${title}${num}`
}

// --- Animated Progress Dots ---
function ProgressDots({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={$progressContainer}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Animated.View
          key={i}
          style={[
            $progressDot,
            i === currentStep && $progressDotActive,
            i < currentStep && $progressDotCompleted,
          ]}
          entering={FadeIn.delay(i * 100)}
        />
      ))}
    </View>
  )
}

// --- Spinning Washer Icon ---
function SpinningWasher() {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.Text style={[{ fontSize: 48, textAlign: "center" }, animatedStyle]}>
      {"@"}
    </Animated.Text>
  )
}

// --- Bouncing Dice Button ---
function DiceButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1)

  const bounce = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.85, { damping: 4 }),
      withSpring(1.15, { damping: 4 }),
      withSpring(1, { damping: 8 }),
    )
    onPress()
  }, [onPress])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <TouchableOpacity onPress={bounce} activeOpacity={0.8}>
      <Animated.View style={[$diceButton, animatedStyle]}>
        <Text text="Shuffle" style={$diceButtonText} />
      </Animated.View>
    </TouchableOpacity>
  )
}

// ============================================================
// STEP 1: USERNAME
// ============================================================
interface UsernameStepProps {
  username: string
  setUsername: (v: string) => void
  onContinue: () => void
  isLoading: boolean
  error: string
  isUsernameTaken: boolean
}

function UsernameStep({ username, setUsername, onContinue, isLoading, error, isUsernameTaken }: UsernameStepProps) {
  const usernameInput = useRef<TextInput>(null)

  const handleGenerate = useCallback(() => {
    setUsername(generateLaundryUsername())
  }, [setUsername])

  return (
    <Animated.View
      entering={SlideInRight.duration(400).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutLeft.duration(300)}
      style={$stepContainer}
    >
      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        <Text text="What should we call you?" preset="heading" style={$stepTitle} />
        <Text
          text="Every laundry hero needs a name"
          style={$stepSubtitle}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={$usernameCard}>
        <View style={$generateRow}>
          <Text text="Try a laundry name:" style={$generateLabel} />
          <DiceButton onPress={handleGenerate} />
        </View>

        <TextField
          ref={usernameInput}
          value={username}
          onChangeText={setUsername}
          containerStyle={$textField}
          autoCapitalize="none"
          autoCorrect={false}
          label="Username"
          placeholder="Pick something fun..."
          helper={error || (isUsernameTaken ? "That name's taken! Try another" : "")}
          status={error || isUsernameTaken ? "error" : undefined}
          onSubmitEditing={onContinue}
        />

        {isLoading && <ActivityIndicator color={colors.palette.primary600} style={$loader} />}

        <Button
          text="Lock It In"
          preset="primary"
          style={$continueButton}
          textStyle={$continueButtonText}
          onPress={onContinue}
          disabled={isLoading}
        />
      </Animated.View>
    </Animated.View>
  )
}

// ============================================================
// STEP 2: AVATAR
// ============================================================
interface AvatarStepProps {
  selectedAvatar: number
  setSelectedAvatar: (v: number) => void
  onContinue: () => void
  isLoading: boolean
}

function AvatarStep({ selectedAvatar, setSelectedAvatar, onContinue, isLoading }: AvatarStepProps) {
  const bounceValue = useSharedValue(1)

  const handleSelect = useCallback((index: number) => {
    setSelectedAvatar(index)
    bounceValue.value = withSequence(
      withSpring(1.1, { damping: 4 }),
      withSpring(1, { damping: 8 }),
    )
  }, [setSelectedAvatar])

  const selectedAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceValue.value }],
  }))

  return (
    <Animated.View
      entering={SlideInRight.duration(400).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutLeft.duration(300)}
      style={$stepContainer}
    >
      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        <Text text="Show us your clean side" preset="heading" style={$stepTitle} />
        <Text
          text="Pick an avatar that matches your laundry spirit"
          style={$stepSubtitle}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={$avatarCard}>
        {selectedAvatar > 0 && (
          <Animated.View style={[$selectedAvatarPreview, selectedAnimStyle]}>
            <Image source={AVATARS[selectedAvatar - 1]} style={$selectedAvatarImage} />
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={$avatarGrid}
          showsVerticalScrollIndicator={false}
        >
          {AVATARS.map((avatar, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(500 + index * 80).duration(300)}
            >
              <AvatarSelect
                avatar={avatar}
                selected={selectedAvatar === index + 1}
                onPress={() => handleSelect(index + 1)}
              />
            </Animated.View>
          ))}
        </ScrollView>

        {isLoading && <ActivityIndicator color={colors.palette.primary600} style={$loader} />}

        <Button
          text="Looking Good!"
          preset="primary"
          style={$continueButton}
          textStyle={$continueButtonText}
          onPress={onContinue}
          disabled={isLoading || selectedAvatar === 0}
        />
      </Animated.View>
    </Animated.View>
  )
}

// ============================================================
// STEP 3: GROUP
// ============================================================
interface GroupStepProps {
  onComplete: () => void
  onSkip: () => void
}

function GroupStep({ onComplete, onSkip }: GroupStepProps) {
  const { setUserGroupId } = useAuthStore()
  const passcodeInput = useRef<TextInput>(null)

  const [mode, setMode] = useState<"choose" | "create" | "find">("choose")
  const [groupName, setGroupName] = useState("")
  const [searchGroupName, setSearchGroupName] = useState("")
  const [passcode, setPasscode] = useState("")
  const [usePasscode, setUsePasscode] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchedGroups, setSearchedGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const groupNameError = hasSubmitted && groupName.length < 6
    ? (groupName.length === 0 ? "can't be blank" : "must be at least 6 characters")
    : ""

  function search() {
    setIsLoading(true)
    api.searchGroupsByName(searchGroupName)
      .then((response) => {
        if (response.kind === "ok") setSearchedGroups(response.groups)
        else setSearchedGroups([])
      })
      .catch(() => setSearchedGroups([]))
      .finally(() => { setIsLoading(false); setHasSearched(true) })
  }

  function createGroup() {
    setHasSubmitted(true)
    if (groupName.length < 6 || (usePasscode && !passcode)) return
    setIsLoading(true)
    api.createGroup(groupName, passcode)
      .then((response) => {
        if (response.kind === "ok" && response.group) {
          setUserGroupId(response.group.group_id)
          onComplete()
        }
      })
      .catch(() => Alert.alert("Oops!", `"${groupName}" is already taken. Great minds think alike!`))
      .finally(() => setIsLoading(false))
  }

  function joinGroup(group: Group) {
    Alert.alert("Join Group", `Ready to launder with ${group.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Join",
        onPress: () => {
          if (group.hasPasscode) {
            Alert.prompt("Passcode", "Enter the group passcode", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Join",
                onPress: (code: string | undefined) => {
                  setIsLoading(true)
                  api.joinGroup(group.group_id, code || "")
                    .then((res) => {
                      if (res.kind === "ok" && res.group) {
                        setUserGroupId(res.group.group_id)
                        onComplete()
                      }
                    })
                    .catch(() => Alert.alert("Error", "Wrong passcode!"))
                    .finally(() => setIsLoading(false))
                },
              },
            ], "secure-text")
          } else {
            setIsLoading(true)
            api.joinGroup(group.group_id, "")
              .then((res) => {
                if (res.kind === "ok" && res.group) {
                  setUserGroupId(res.group.group_id)
                  onComplete()
                }
              })
              .catch(() => Alert.alert("Error", "Couldn't join this group"))
              .finally(() => setIsLoading(false))
          }
        },
      },
    ])
  }

  return (
    <Animated.View
      entering={SlideInRight.duration(400).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutLeft.duration(300)}
      style={$stepContainer}
    >
      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        <Text text="Join the laundry revolution" preset="heading" style={$stepTitle} />
        <Text
          text="Laundry is better together"
          style={$stepSubtitle}
        />
      </Animated.View>

      {mode === "choose" ? (
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={$groupChoiceContainer}>
          <TouchableOpacity
            style={$groupChoiceCard}
            onPress={() => setMode("create")}
            activeOpacity={0.8}
          >
            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <Text style={$groupChoiceEmoji}>{"+"}</Text>
              <Text text="Create a Group" style={$groupChoiceTitle} />
              <Text text="Start fresh with your crew" style={$groupChoiceDesc} />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[$groupChoiceCard, $groupChoiceCardAlt]}
            onPress={() => setMode("find")}
            activeOpacity={0.8}
          >
            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <Text style={$groupChoiceEmoji}>{"?"}</Text>
              <Text text="Find a Group" style={$groupChoiceTitle} />
              <Text text="Join an existing laundry squad" style={$groupChoiceDesc} />
            </Animated.View>
          </TouchableOpacity>

          <Button
            text="Skip for now"
            preset="clear"
            style={$skipButton}
            textStyle={$skipButtonText}
            onPress={onSkip}
          />
        </Animated.View>
      ) : mode === "create" ? (
        <Animated.View entering={FadeInDown.duration(400)} style={$groupFormCard}>
          <TextField
            value={groupName}
            onChangeText={setGroupName}
            containerStyle={$textField}
            autoCapitalize="none"
            autoCorrect={false}
            label="Group Name"
            placeholder="The Clean Machine"
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
              autoCorrect={false}
              label="Passcode"
              placeholder="secretSuds123"
            />
          )}
          {isLoading && <ActivityIndicator color={colors.palette.primary600} style={$loader} />}
          <Button text="Create Group" preset="primary" style={$continueButton} textStyle={$continueButtonText} onPress={createGroup} disabled={isLoading} />
          <Button text="Back" preset="clear" onPress={() => setMode("choose")} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(400)} style={$groupFormCard}>
          <TextField
            value={searchGroupName}
            onChangeText={setSearchGroupName}
            containerStyle={$textField}
            autoCapitalize="none"
            autoCorrect={false}
            label="Search Groups"
            placeholder="Type a group name..."
            onSubmitEditing={search}
          />
          <Button text="Search" preset="primary" style={$continueButton} textStyle={$continueButtonText} onPress={search} disabled={isLoading} />

          {isLoading && <ActivityIndicator color={colors.palette.primary600} style={$loader} />}

          <ScrollView style={$searchResults} showsVerticalScrollIndicator={false}>
            {searchedGroups.length > 0 ? (
              searchedGroups.map((group) => (
                <GroupItem
                  key={group.group_id}
                  text={group.name}
                  bottomSeparator
                  hasPasscode={group.hasPasscode}
                  membersCount={group.numberOfMembers}
                  owner={group.ownerName}
                  avatarId={group.avatar_id}
                  onPress={() => joinGroup(group)}
                />
              ))
            ) : hasSearched ? (
              <Text text="No groups found!" style={$noResults} />
            ) : null}
          </ScrollView>

          <Button text="Back" preset="clear" onPress={() => setMode("choose")} />
        </Animated.View>
      )}
    </Animated.View>
  )
}

// ============================================================
// MAIN ONBOARDING FLOW SCREEN
// ============================================================
interface OnboardingFlowScreenProps extends AppStackScreenProps<"OnboardingFlow"> {}

export const OnboardingFlowScreen: FC<OnboardingFlowScreenProps> = function OnboardingFlowScreen(_props) {
  const {
    setAuthToken,
    setRefreshToken,
    distributeAuthToken,
    setUserId,
    setOnboardingComplete,
    setOnboardingStep,
    onboardingStep: savedStep,
  } = useAuthStore()

  const isAuthenticated = useAuthStore((s) => !!s.authToken)
  const email = _props.route.params?.email
  const password = _props.route.params?.password

  // If already authenticated, skip username step
  const initialStep = isAuthenticated ? Math.max(savedStep, 1) : 0
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [username, setUsername] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [isUsernameTaken, setIsUsernameTaken] = useState(false)

  const totalSteps = 3

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
    setOnboardingStep(step)
  }, [])

  // Step 1: Validate username and register
  const handleUsernameContinue = useCallback(async () => {
    setUsernameError("")
    setIsUsernameTaken(false)

    if (username.length === 0) { setUsernameError("can't be blank"); return }
    if (username.length < 5) { setUsernameError("must be at least 5 characters"); return }

    setIsLoading(true)
    try {
      const availData = await api.isUsernameAvailable(username)
      if (!availData.isAvailable) {
        setIsUsernameTaken(true)
        setIsLoading(false)
        return
      }

      const data = await api.register(email!, username, password!)
      setOnboardingComplete(false)
      setAuthToken(data.user.token)
      setRefreshToken(data.user.refreshToken)
      setUserId(data.user.userId)
      distributeAuthToken()
      setIsLoading(false)
      goToStep(1)
    } catch {
      setIsLoading(false)
      Alert.alert("Error", "Something went wrong. Please try again.")
    }
  }, [username, email, password])

  // Step 2: Set avatar
  const handleAvatarContinue = useCallback(async () => {
    setIsLoading(true)
    try {
      await api.editProfile("", "", selectedAvatar)
      setIsLoading(false)
      goToStep(2)
    } catch {
      setIsLoading(false)
      goToStep(2)
    }
  }, [selectedAvatar])

  // Step 3: Complete
  const handleGroupComplete = useCallback(async () => {
    setOnboardingComplete(true)
    setOnboardingStep(0)
    try { await api.completeOnboarding() } catch {}
  }, [])

  const handleSkip = useCallback(async () => {
    setOnboardingComplete(true)
    setOnboardingStep(0)
    try { await api.completeOnboarding() } catch {}
  }, [])

  return (
    <View style={$outerContainer}>
      <FloatingBubbles count={12} />

      <View style={$safeArea}>
        <Animated.View entering={FadeIn.duration(600)} style={$header}>
          <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
          <Text
            text={`Step ${currentStep + 1} of ${totalSteps}`}
            style={$stepCounter}
          />
        </Animated.View>

        <ScrollView
          contentContainerStyle={$scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 0 && (
            <UsernameStep
              username={username}
              setUsername={setUsername}
              onContinue={handleUsernameContinue}
              isLoading={isLoading}
              error={usernameError}
              isUsernameTaken={isUsernameTaken}
            />
          )}

          {currentStep === 1 && (
            <AvatarStep
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              onContinue={handleAvatarContinue}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && (
            <GroupStep
              onComplete={handleGroupComplete}
              onSkip={handleSkip}
            />
          )}
        </ScrollView>
      </View>
    </View>
  )
}

// ============================================================
// STYLES
// ============================================================

const $outerContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral100,
}

const $safeArea: ViewStyle = {
  flex: 1,
  paddingTop: 60,
}

const $header: ViewStyle = {
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.md,
}

const $scrollContent: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
  flexGrow: 1,
}

const $progressContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
  marginBottom: spacing.xs,
}

const $progressDot: ViewStyle = {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: colors.palette.neutral300,
}

const $progressDotActive: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  width: 32,
  borderRadius: 6,
}

const $progressDotCompleted: ViewStyle = {
  backgroundColor: colors.palette.primary700,
}

const $stepCounter: TextStyle = {
  fontSize: 13,
  color: colors.palette.accent500,
  fontFamily: typography.primary.medium,
}

const $stepContainer: ViewStyle = {
  flex: 1,
}

const $stepTitle: TextStyle = {
  marginBottom: spacing.xxs,
  color: colors.palette.primary800,
  fontSize: 28,
  lineHeight: 36,
  textAlign: "center",
}

const $stepSubtitle: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.xl,
  color: colors.palette.accent500,
  fontSize: 16,
  lineHeight: 22,
}

const $usernameCard: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  borderRadius: 20,
  padding: spacing.lg,
  shadowColor: colors.palette.primary800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 8,
}

const $generateRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.md,
}

const $generateLabel: TextStyle = {
  fontSize: 15,
  color: colors.palette.accent600,
  fontFamily: typography.primary.medium,
}

const $diceButton: ViewStyle = {
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: 12,
  borderWidth: 1.5,
  borderColor: colors.palette.primary300,
}

const $diceButtonText: TextStyle = {
  fontSize: 14,
  color: colors.palette.primary700,
  fontFamily: typography.primary.bold,
}

const $textField: ViewStyle = {
  marginBottom: spacing.md,
}

const $loader: ViewStyle = {
  marginBottom: spacing.sm,
}

const $continueButton: ViewStyle = {
  borderRadius: 14,
  minHeight: 52,
  backgroundColor: colors.palette.primary600,
  marginTop: spacing.xs,
}

const $continueButtonText: TextStyle = {
  fontSize: 17,
  color: colors.palette.neutral100,
}

const $avatarCard: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  borderRadius: 20,
  padding: spacing.lg,
  shadowColor: colors.palette.primary800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 8,
  alignItems: "center",
}

const $selectedAvatarPreview: ViewStyle = {
  marginBottom: spacing.lg,
  borderRadius: 60,
  overflow: "hidden",
  borderWidth: 3,
  borderColor: colors.palette.primary500,
}

const $selectedAvatarImage: ImageStyle = {
  width: 100,
  height: 100,
}

const $avatarGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: spacing.xs,
  marginBottom: spacing.lg,
}

const $groupChoiceContainer: ViewStyle = {
  gap: spacing.md,
}

const $groupChoiceCard: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  borderRadius: 20,
  padding: spacing.xl,
  shadowColor: colors.palette.primary800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 8,
  alignItems: "center",
  borderWidth: 2,
  borderColor: colors.palette.primary200,
}

const $groupChoiceCardAlt: ViewStyle = {
  borderColor: colors.palette.secondary200,
}

const $groupChoiceEmoji: TextStyle = {
  fontSize: 36,
  lineHeight: 48,
  textAlign: "center",
  marginBottom: spacing.sm,
  color: colors.palette.primary600,
  fontFamily: typography.primary.bold,
}

const $groupChoiceTitle: TextStyle = {
  fontSize: 20,
  textAlign: "center",
  color: colors.palette.primary800,
  fontFamily: typography.primary.bold,
  marginBottom: spacing.xxs,
}

const $groupChoiceDesc: TextStyle = {
  fontSize: 14,
  textAlign: "center",
  color: colors.palette.accent500,
}

const $skipButton: ViewStyle = {
  marginTop: spacing.sm,
}

const $skipButtonText: TextStyle = {
  color: colors.palette.accent400,
  fontSize: 15,
}

const $groupFormCard: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  borderRadius: 20,
  padding: spacing.lg,
  shadowColor: colors.palette.primary800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 8,
}

const $toggleStyle: ViewStyle = {
  marginBottom: spacing.md,
}

const $searchResults: ViewStyle = {
  maxHeight: 300,
  marginTop: spacing.md,
}

const $noResults: TextStyle = {
  textAlign: "center",
  color: colors.palette.accent400,
  marginTop: spacing.md,
}
