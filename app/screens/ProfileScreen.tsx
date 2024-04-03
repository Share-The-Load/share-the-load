import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle, Image, ScrollView, Platform, Alert } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { AvatarSelect, Button, ListItem, Screen, Text, TextField } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"

import RNPickerSelect from "react-native-picker-select"
import RNDateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { set } from "date-fns"
import { AVATARS, getAvatarImage } from "app/constants/images"
import Modal from "react-native-modal"
import moment from "moment"

interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

export const ProfileScreen: FC<ProfileScreenProps> = observer(function ProfileScreen() {
  const {
    authenticationStore: { logout, distributeAuthToken, userId },
    userStore: {
      getProfile,
      updateLoadTime,
      updatePreference,
      editProfile,
      deleteAccount,
      profile,
    },
    groupStore: { updateUserMemberAvatar },
  } = useStores()

  const [isEditing, setIsEditing] = useState(false)
  const [email, setEmail] = useState(profile?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [avatar, setAvatar] = useState(profile?.avatar || 1)

  const emailError = isSubmitted ? registerEmailValidationError() : ""
  const passwordError = isSubmitted ? registerPasswordValidationError() : ""

  function registerEmailValidationError() {
    if (email?.length === 0) return "can't be blank"
    if (email?.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "must be a valid email address"
    return ""
  }

  function registerPasswordValidationError() {
    if (newPassword.length > 0 && newPassword.length < 6) return "must be at least 6 characters"
    return ""
  }

  function createDate(time: string): Date {
    const [hours, minutes] = time.split(":").map((t) => parseInt(t))
    return set(new Date(), { hours, minutes })
  }

  const formatTime = (date: Date | undefined) => {
    const hours = date?.getHours()
    const minutes = date?.getMinutes()
    return `${hours}:${minutes}`
  }

  useEffect(() => {
    distributeAuthToken()
    getProfile()
      .catch((e) => console.log(e))
      .then(() => {
        console.log("ProfileScreen loaded")
      })
    return () => console.log("ProfileScreen unmounted")
  }, [])

  function callUpdateLoadTime(loadTime: number) {
    if (loadTime === profile?.load_time) return
    if (loadTime == null) return
    updateLoadTime(loadTime)
      .then(() => console.log("Updated Load Time"))
      .catch((e) => console.log(e))
  }

  function callUpdatePrefTime(preference_id: number, startTime: string, endTime: string) {
    updatePreference(preference_id, startTime, endTime)
      .then(() => console.log("Upadated Pref Time"))
      .catch((e) => console.log(e))
  }

  function callEditProfile() {
    setIsSubmitted(true)
    if (registerEmailValidationError()) return
    if (registerPasswordValidationError()) return
    editProfile(email, newPassword, avatar)
      .then(() => {
        //update group member
        updateUserMemberAvatar(avatar, userId || 0)
        setEmail(email)
        setNewPassword("")
        setAvatar(avatar)
        setIsEditing(!isEditing)
      })
      .catch((e) => console.log(e))
  }

  function callDeleteAccount() {
    Alert.alert("Delete Account", "Are you sure you want to delete your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          deleteAccount()
            .then((response: any) => {
              console.log(response)
              Alert.alert("Success", "Account will be deleted in 24-48 hours.")
              logout()
            })
            .catch((error: any) => {
              Alert.alert("Error", "An error occurred. Please try again later")
              console.log(error)
            })
        },
      },
    ])
  }

  const openPreferencePicker = (pref: any, startOrEnd: string) => {
    DateTimePickerAndroid.open({
      value: createDate(pref?.[startOrEnd]),
      mode: "time",
      minuteInterval: 30,
      onChange: (event, newTime) => {
        const time = formatTime(newTime)
        if (startOrEnd === "start_time")
          callUpdatePrefTime(pref?.preference_id, time, pref?.end_time)
        else callUpdatePrefTime(pref?.preference_id, pref?.start_time, time)
      },
    })
  }

  const formatAndroidButtonTime = (time: string) => {
    return moment(time, "HH:mm:ss").format("h:mm a")
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Image
          style={{ alignSelf: "flex-start", marginEnd: spacing.md, width: 100, height: 100 }}
          source={getAvatarImage(profile?.avatar)}
        />
        <View>
          <Text style={$titleStyle} text={profile?.username} />
          <Text style={$subheaderStyle} text={profile?.email} />
          <Text style={$subheaderStyle} text={`${profile?.loads} loads shared`} />
          <Text style={$subheaderStyle} text={profile?.profileTitle} />

          <Text style={$subheaderStyle} text={`Sharing Loads for ${profile?.memberSince}`} />
        </View>
      </View>
      <Button preset="small" text="Edit Profile" onPress={() => setIsEditing(true)} />
      <Text preset="subheading" style={{ marginTop: spacing.md }} text="Preferences" />
      <ListItem
        text="Load Time"
        RightComponent={
          <RNPickerSelect
            onValueChange={(value) => callUpdateLoadTime(value)}
            style={{
              viewContainer: {
                alignSelf: "center",
                backgroundColor: colors.palette.accent100,
                borderRadius: 10,
                width: 120,
                height: 40,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              },
              inputIOS: {
                fontSize: 18,
              },
              inputAndroidContainer: {
                alignSelf: "center",
                backgroundColor: colors.palette.accent100,
                borderRadius: 10,
                width: 120,
                height: 40,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              },
              inputAndroid: {
                fontSize: 18,
                color: colors.palette.accent800,
              },
            }}
            value={profile?.load_time}
            useNativeAndroidPickerStyle={false}
            items={[
              { label: "30 minutes", value: 30 },
              { label: "60 minutes", value: 60 },
              { label: "90 minutes", value: 90 },
              { label: "120 minutes", value: 120 },
              { label: "150 minutes", value: 150 },
              { label: "180 minutes", value: 180 },
            ]}
          />
        }
      />
      {profile?.preferences.map((pref) => (
        <ListItem
          key={pref?.day}
          text={pref?.day}
          bottomSeparator={true}
          RightComponent={
            <View
              style={{
                justifyContent: "center",
                alignItems: "flex-start",
                alignSelf: "center",
                flexDirection: "row",
              }}
            >
              {Platform.OS == "ios" ? (
                <RNDateTimePicker
                  mode="time"
                  minuteInterval={30}
                  value={createDate(pref?.start_time)}
                  onChange={(event, newStartTime) => {
                    const time = formatTime(newStartTime)
                    callUpdatePrefTime(pref?.preference_id, time, pref?.end_time)
                  }}
                />
              ) : (
                <Button
                  style={$prefButton}
                  preset="small"
                  text={formatAndroidButtonTime(pref?.start_time)}
                  onPress={() => openPreferencePicker(pref, "start_time")}
                  textStyle={{ color: colors.palette.accent800 }}
                />
              )}
              <Text style={{ marginTop: spacing.xxs, marginHorizontal: spacing.xs }} text={`-`} />

              {Platform.OS == "ios" ? (
                <RNDateTimePicker
                  mode="time"
                  minuteInterval={30}
                  value={createDate(pref?.end_time)}
                  onChange={(event, newEndTime) => {
                    const newTime = formatTime(newEndTime)
                    callUpdatePrefTime(pref?.preference_id, pref?.start_time, newTime)
                  }}
                />
              ) : (
                <Button
                  preset="small"
                  style={$prefButton}
                  text={formatAndroidButtonTime(pref?.end_time)}
                  onPress={() => openPreferencePicker(pref, "end_time")}
                  textStyle={{ color: colors.palette.accent800 }}
                />
              )}
            </View>
          }
        />
      ))}
      <View style={$buttonContainer}>
        <Button preset="default" tx="common.logOut" onPress={logout} />
        <Button
          style={{ marginVertical: spacing.sm }}
          preset="filled"
          text="Delete Account"
          onPress={callDeleteAccount}
        />
      </View>
      <Modal
        isVisible={isEditing}
        backdropColor="white"
        backdropOpacity={1}
        scrollHorizontal={true}
        coverScreen={true}
      >
        <ScrollView style={{ marginTop: spacing.xxxl }}>
          <Text preset="subheading" style={{ marginBottom: 20 }} text="Edit Profile" />

          <TextField
            value={profile?.username}
            editable={false}
            containerStyle={{ marginBottom: spacing.md }}
          />
          <TextField
            value={email}
            onChangeText={setEmail}
            containerStyle={{ marginBottom: spacing.md }}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email"
            placeholder="Enter your email"
            helper={emailError}
            status={emailError ? "error" : undefined}
          />
          <Text preset="formLabel" style={{ marginBottom: 20 }} text="Avatar" />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {AVATARS.map((group, index) => (
              <AvatarSelect
                key={group}
                avatar={group}
                selected={index + 1 === avatar}
                onPress={() => setAvatar(index + 1)}
              ></AvatarSelect>
            ))}
          </View>

          <TextField
            value={newPassword}
            onChangeText={setNewPassword}
            containerStyle={{ marginBottom: spacing.md }}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            keyboardType="default"
            label="Change Password"
            placeholder="super secret password"
            helper="Must be at least 6 characters"
            status={passwordError ? "error" : undefined}
          />

          <View style={$buttonContainer}>
            <Button
              preset="primary"
              text="Save"
              style={{ marginBottom: spacing.sm }}
              onPress={() => {
                console.log("Modal has been closed.")
                callEditProfile()
              }}
              disabledStyle={{ backgroundColor: colors.palette.neutral400 }}
              disabled={emailError !== ""}
            />
            <Button
              preset="default"
              text="Cancel"
              onPress={() => {
                console.log("Modal has been closed.")
                setIsEditing(!isEditing)
                setAvatar(profile?.avatar || 1)
                setEmail(profile?.email || "")
                setNewPassword("")
              }}
            />
          </View>
        </ScrollView>
      </Modal>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  paddingHorizontal: spacing.lg,
}

const $prefButton: ViewStyle = {
  // marginHorizontal: spacing.xs,
  backgroundColor: colors.palette.accent100,
}

const $titleStyle: TextStyle = {
  flexGrow: 1,
  color: colors.palette.primary600,
  fontSize: 25,
}
const $subheaderStyle: TextStyle = {
  paddingVertical: spacing.xxxs,
  color: colors.textDim,
}

const $buttonContainer: ViewStyle = {
  marginVertical: spacing.md,
}
