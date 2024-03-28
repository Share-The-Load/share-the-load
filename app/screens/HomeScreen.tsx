import React, { FC, Fragment, useEffect, useState } from "react"
import {
  ImageStyle,
  TextStyle,
  ViewStyle,
  Image,
  View,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native"
import Modal from "react-native-modal"
import { MainTabScreenProps } from "app/navigators"
import { Button, Card, Icon, ImageSelect, ListItem, Screen, Text, Toggle } from "app/components"
import { colors, spacing } from "../theme"
import { useStores } from "../models"
import { getRandomNoLoadMessage } from "app/constants/noLoadMessages"
import { getLoadImage } from "app/constants/images"
import { observer } from "mobx-react-lite"

const stlLogo = require("../../assets/images/logo.png")
const oysterLogo = require("../../assets/images/oyster.png")

export const HomeScreen: FC<MainTabScreenProps<"Home">> = observer(function HomeScreen(_props) {
  const {
    groupStore: { getLoads, schedule, deleteLoad, yourGroup, hasLoads },
    authenticationStore: { distributeAuthToken, userId },
  } = useStores()

  const [refreshing, setRefreshing] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  const [loads, setLoads] = useState([] as any)

  useEffect(() => {
    distributeAuthToken()
    console.log("HomeScreen mounted")
    getLoads()
      .catch((error) => {
        getLoads().catch((error) => console.error("Error getting loads", error))
      })
      .then(() => {
        console.log("Loads fetched")
      })
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    getLoads()
      .catch((error) => console.error("Error getting loads", error))
      .then(() => {
        console.log("Loads fetched")
        setRefreshing(false)
      })
  }

  function addLoad(loadType: string) {
    const randomThreeDigitId = Math.floor(Math.random() * 900) + 100
    setLoads([...loads, { type: loadType, id: randomThreeDigitId }])
  }

  function scheduleLoad() {
    setRefreshing(true)
    schedule(loads, isUrgent)
      .catch((error) => console.error("Error scheduling load", error))
      .then(() => {
        console.log("Load scheduled")
        setLoads([])
        getLoads()
          .catch((error) => console.error("Error getting loads", error))
          .then(() => {
            setRefreshing(false)
          })
      })
  }

  function deleteLoadFunction(loadId: number) {
    deleteLoad(loadId)
      .then(() => {
        console.log("Load deleted")
        getLoads()
          .catch((error) => console.error("Error getting loads", error))
          .then(() => {
            console.log(`❗️❗️❗️ fetched loads after delete`)
            setRefreshing(false)
          })
      })
      .catch((error) => console.error("Error deleting load", error))
  }

  return (
    <>
      <Screen
        preset="scroll"
        safeAreaEdges={["top"]}
        contentContainerStyle={$container}
        ScrollViewProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
        }}
      >
        <Image style={$welcomeLogo} source={stlLogo} resizeMode="contain" />

        {hasLoads ? (
          <>
            {yourGroup?.groupLoadDays.map((day) => (
              <Fragment key={day?.day}>
                <Text
                  key={day?.day}
                  preset="subheading"
                  text={day?.day || ""}
                  style={{ marginBottom: spacing.sm }}
                />

                {!!!day?.hasLoads ? (
                  <Text
                    preset="default"
                    text={getRandomNoLoadMessage()}
                    key={day?.day + "noLoads"}
                    style={{ marginBottom: spacing.sm }}
                  />
                ) : (
                  <>
                    {day?.loads.map((load) => (
                      <Card
                        key={load?.load_id}
                        heading={load?.loadMember?.username || ""}
                        content={`${load.loadTime}`}
                        footer={load?.load_type || ""}
                        style={{ marginBottom: spacing.sm, alignItems: "center" }}
                        LeftComponent={
                          <Image
                            source={getLoadImage(load?.load_type)}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 20,
                              marginEnd: spacing.xs,
                            }}
                          />
                        }
                        RightComponent={
                          <Icon
                            icon="trash"
                            size={24}
                            color={colors.palette.angry100}
                            onPress={() => {
                              Alert.alert(
                                "Delete Load",
                                `Risk having to turn those undies inside out?`,
                                [
                                  {
                                    text: "Cancel",
                                    onPress: () => console.log("Cancel Pressed"),
                                    style: "cancel",
                                  },
                                  {
                                    text: "Delete",
                                    onPress: () => deleteLoadFunction(load?.load_id),
                                  },
                                ],
                                { cancelable: false },
                              )
                            }}
                          />
                        }
                      />
                    ))}
                  </>
                )}
              </Fragment>
            ))}
          </>
        ) : (
          <>
            <Text
              preset="subheading"
              text="Wow, no loads scheduled. The laundry room is your oyster..."
              style={$title}
            />
            <Image style={$oyster} source={oysterLogo} resizeMode="contain" />
          </>
        )}
        <Modal
          isVisible={isScheduling}
          backdropColor="white"
          backdropOpacity={1}
          scrollHorizontal={true}
          coverScreen={true}
        >
          <ScrollView style={{ marginVertical: 50 }}>
            <Text
              preset="subheading"
              style={{ marginBottom: 20 }}
              text="Share The Load Scheduler"
            />

            <Text preset="default" style={{ marginBottom: 20 }} text="Select the load type:" />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignContent: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <ImageSelect label="Whites" onPress={() => addLoad("Whites")} />
              <ImageSelect label="Darks" onPress={() => addLoad("Darks")} />
              <ImageSelect label="Colors" onPress={() => addLoad("Colors")} />
              <ImageSelect label="Delicates" onPress={() => addLoad("Delicates")} />
              <ImageSelect label="Towels" onPress={() => addLoad("Towels")} />
              <ImageSelect label="Bedding" onPress={() => addLoad("Bedding")} />
              <ImageSelect label="Other" onPress={() => addLoad("Other")} />
            </View>

            <Text preset="default" style={{ marginBottom: 10 }} text="Loads:" />

            {!loads.length && (
              <Text
                preset="formHelper"
                text="No loads scheduled"
                style={{ color: colors.palette.accent400 }}
              />
            )}

            {loads.map((load: any) => (
              <ListItem
                key={load?.id}
                text={load?.type || ""}
                style={{ alignItems: "center" }}
                LeftComponent={
                  <Image
                    source={getLoadImage(load?.type)}
                    style={{ width: 30, height: 30, marginEnd: spacing.sm }}
                  />
                }
                RightComponent={
                  <Icon
                    icon="trash"
                    size={24}
                    color={colors.palette.angry500}
                    onPress={() => setLoads(loads.filter((l: any) => l.id !== load.id))}
                  />
                }
              ></ListItem>
            ))}

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
                onPress={() => {
                  console.log("Modal has been closed.")
                  setIsScheduling(!isScheduling)
                  scheduleLoad()
                }}
                disabledStyle={{ backgroundColor: colors.palette.neutral400 }}
                // disabled={groupNameError !== ""}
              />
              <Button
                preset="default"
                text="Cancel"
                onPress={() => {
                  console.log("Modal has been closed.")
                  setIsScheduling(!isScheduling)
                  setLoads([])
                  setIsUrgent(false)
                }}
              />
            </View>
          </ScrollView>
        </Modal>
      </Screen>
      <View>
        <Button
          preset="primary"
          style={$button}
          text="Schedule a Load"
          onPress={() => (isScheduling ? setIsScheduling(false) : setIsScheduling(true))}
        />
      </View>
    </>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.xxs,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.lg,
  color: colors.palette.accent600,
}

const $welcomeLogo: ImageStyle = {
  height: 88,
  marginBottom: spacing.lg,
  marginTop: spacing.sm,
  alignContent: "flex-start",
  marginLeft: -80,
}

const $oyster: ImageStyle = {
  height: 400,
  width: "100%",
  marginBottom: spacing.sm,
  marginTop: spacing.sm,
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}
