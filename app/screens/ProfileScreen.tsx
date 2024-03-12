import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, TextStyle, View, ViewStyle, Image } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, ListItem, Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import RNPickerSelect from "react-native-picker-select"
import RNDateTimePicker from "@react-native-community/datetimepicker"
import { set } from "date-fns"
import { ListItemNoClick } from "app/components/ListItemNoClick"

const avatar = require("../../assets/images/app-icon-all.png")

interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

export const ProfileScreen: FC<ProfileScreenProps> = observer(function ProfileScreen() {
  const {
    authenticationStore: { logout },
    userStore: { getProfile, updateLoadTime, updatePreference, profile },
  } = useStores()

  const [isLoading, setIsLoading] = useState(false)

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
    getProfile()
      .catch((e) => console.log(e))
      .then(() => {
        console.log("ProfileScreen loaded")
      })
    return () => console.log("ProfileScreen unmounted")
  }, [])

  function callUpdateLoadTime(loadTime: number) {
    updateLoadTime(loadTime)
      .then(() => console.log("Updated Load Time"))
      .catch((e) => console.log(e))
  }

  function callUpdatePrefTime(preference_id: number, startTime: string, endTime: string) {
    updatePreference(preference_id, startTime, endTime)
      .then(() => console.log("Upadated Pref Time"))
      .catch((e) => console.log(e))
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      {/* <Text style={$title} preset="heading" text="Profile" /> */}

      <ActivityIndicator animating={isLoading} size="large" color={colors.palette.accent700} />

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Image
          style={{ alignSelf: "flex-start", marginEnd: spacing.md, width: 100, height: 100 }}
          source={avatar}
        />
        <View>
          <Text style={$titleStyle} text={profile?.username} />
          <Text style={$subheaderStyle} text={profile?.email} />
          <Text style={$subheaderStyle} text={`${profile?.loads} loads shared`} />
          <Text style={$subheaderStyle} text={profile?.profileTitle} />
          <Text style={$subheaderStyle} text={`Sharing Loads for ${profile?.memberSince}`} />
        </View>
      </View>

      <Text preset="subheading" style={$subheaderStyle} text="Preferences" />

      <ListItemNoClick
        text="Load Time"
        RightComponent={
          <RNPickerSelect
            onValueChange={(value) => callUpdateLoadTime(value)}
            value={profile?.load_time}
            items={[
              { label: "30 minutes", value: 30 },
              { label: "60 minutes", value: 60 },
              { label: "90 minutes", value: 90 },
              { label: "120 minutes", value: 120 },
              { label: "150 minutes", value: 150 },
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
              <RNDateTimePicker
                mode="time"
                minuteInterval={15}
                value={createDate(pref?.start_time)}
                onChange={(event, newStartTime) => {
                  const time = formatTime(newStartTime)
                  callUpdatePrefTime(pref?.preference_id, time, pref?.end_time)
                }}
              />
              <Text style={{ marginTop: spacing.xxs, marginLeft: spacing.xs }} text={`-`} />
              <RNDateTimePicker
                mode="time"
                minuteInterval={15}
                value={createDate(pref?.end_time)}
                onChange={(event, newEndTime) => {
                  const newTime = formatTime(newEndTime)
                  callUpdatePrefTime(pref?.preference_id, pref?.start_time, newTime)
                }}
              />
            </View>
          }
        />
      ))}

      <View style={$buttonContainer}>
        <Button preset="secondary" tx="common.logOut" onPress={logout} />
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.md,
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
  marginBottom: spacing.md,
}
