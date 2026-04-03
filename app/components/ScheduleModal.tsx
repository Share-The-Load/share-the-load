import React, { useState } from "react"
import {
  Alert,
  Image,
  ImageStyle,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Modal from "react-native-modal"
import { Button, Icon, ImageSelect, Text, Toggle } from "app/components"
import { colors, spacing } from "app/theme"
import { useScheduleStore } from "app/store"
import { api } from "app/services/api"
import { getLoadImage } from "app/constants/images"

export function ScheduleModal() {
  const { isScheduling, closeScheduler, onScheduleComplete } = useScheduleStore()
  const [isUrgent, setIsUrgent] = useState(false)
  const [loads, setLoads] = useState([] as any)

  function addLoad(loadType: string) {
    const randomThreeDigitId = Math.floor(Math.random() * 900) + 100
    setLoads((prev: any[]) => [...prev, { type: loadType, id: randomThreeDigitId }])
  }

  function scheduleLoad() {
    api
      .schedule(loads, isUrgent)
      .then((result) => {
        setLoads([])
        setIsUrgent(false)
        onScheduleComplete?.()
        if (
          "kind" in result &&
          result.kind === "ok" &&
          result.status === "partial" &&
          result.failedLoads?.length
        ) {
          Alert.alert(
            "Some loads couldn't be scheduled",
            `No available time slots for: ${result.failedLoads.join(", ")}`,
          )
        }
      })
      .catch((error) => console.error("Error scheduling load", error))
  }

  return (
    <Modal
      isVisible={isScheduling}
      backdropColor="white"
      backdropOpacity={1}
      scrollHorizontal={true}
      coverScreen={true}
    >
      <ScrollView style={$modalScrollView}>
        <Text preset="subheading" style={$modalTitle} text="Share The Load Scheduler" />

        <Text preset="default" style={$modalSectionLabel} text="Select the load type:" />

        <View style={$loadTypeGrid}>
          <ImageSelect label="Whites" onPress={() => addLoad("Whites")} />
          <ImageSelect label="Darks" onPress={() => addLoad("Darks")} />
          <ImageSelect label="Colors" onPress={() => addLoad("Colors")} />
          <ImageSelect label="Delicates" onPress={() => addLoad("Delicates")} />
          <ImageSelect label="Towels" onPress={() => addLoad("Towels")} />
          <ImageSelect label="Bedding" onPress={() => addLoad("Bedding")} />
          <ImageSelect label="Other" onPress={() => addLoad("Other")} />
        </View>

        <Text preset="default" style={$modalSectionLabel} text="Loads:" />

        <View style={$modalLoadsList}>
          {!loads.length && (
            <Text
              preset="formHelper"
              text="No loads selected"
              style={$modalEmptyText}
            />
          )}

          {loads.map((load: any) => (
            <View key={load?.id} style={$modalLoadItem}>
              <Image source={getLoadImage(load?.type)} style={$modalLoadItemImage} />
              <Text text={load?.type || ""} style={$modalLoadItemText} />
              <Icon
                icon="trash"
                size={20}
                color={colors.palette.angry500}
                onPress={() => setLoads(loads.filter((l: any) => l.id !== load.id))}
              />
            </View>
          ))}
        </View>

        <Toggle
          value={isUrgent}
          onValueChange={() => setIsUrgent(!isUrgent)}
          variant="switch"
          label="Urgent?"
          labelPosition="left"
          containerStyle={{ marginVertical: spacing.md }}
        />

        <View>
          <Button
            preset="primary"
            text="Schedule"
            style={$button}
            disabled={loads.length === 0}
            onPress={() => {
              closeScheduler()
              scheduleLoad()
            }}
            disabledStyle={{
              backgroundColor: colors.palette.neutral400,
            }}
          />
          <Button
            preset="default"
            text="Cancel"
            onPress={() => {
              closeScheduler()
              setLoads([])
              setIsUrgent(false)
            }}
          />
        </View>
      </ScrollView>
    </Modal>
  )
}

const $modalScrollView: ViewStyle = {
  marginVertical: 50,
  paddingHorizontal: spacing.xs,
}

const $modalTitle: TextStyle = {
  marginBottom: spacing.lg,
}

const $modalSectionLabel: TextStyle = {
  marginBottom: spacing.sm,
}

const $loadTypeGrid: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignContent: "flex-start",
  flexWrap: "wrap",
  marginBottom: spacing.md,
}

const $modalLoadsList: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
  padding: spacing.sm,
  marginBottom: spacing.xs,
}

const $modalEmptyText: TextStyle = {
  color: colors.palette.accent400,
  fontStyle: "italic",
  textAlign: "center",
  paddingVertical: spacing.xs,
}

const $modalLoadItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.xs,
  marginBottom: spacing.xs,
}

const $modalLoadItemImage: ImageStyle = {
  width: 30,
  height: 30,
  borderRadius: 15,
  marginEnd: spacing.sm,
}

const $modalLoadItemText: TextStyle = {
  flex: 1,
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}
