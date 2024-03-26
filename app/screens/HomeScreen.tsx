import React, { FC, useEffect, useState } from "react"
import { ImageStyle, TextStyle, ViewStyle, Image, View, RefreshControl, Modal } from "react-native"
import { MainTabScreenProps } from "app/navigators"
import { Button, Card, Icon, ImageSelect, ListItem, Screen, Text, Toggle } from "app/components"
import { colors, spacing } from "../theme"
import { useStores } from "../models"
import { getRandomNoLoadMessage } from "app/constants/noLoadMessages"
import { getLoadImage } from "app/constants/images"

const welcomeLogo = require("../../assets/images/shareTheLoadLogo.png")
const oysterLogo = require("../../assets/images/oyster.png")

export const HomeScreen: FC<MainTabScreenProps<"Home">> = function HomeScreen(_props) {
  const {
    groupStore: { getLoads, schedule, yourGroup, hasLoads },
    authenticationStore: { validateAndRefreshToken },
  } = useStores()

  const [refreshing, setRefreshing] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  const [loads, setLoads] = useState([] as any)

  useEffect(() => {
    console.log("HomeScreen mounted")
    getLoads()
      .catch((error) => {
        validateAndRefreshToken()
        getLoads().catch((error) => console.error("Error getting loads", error))
      })
      .then(() => {
        console.log("Loads fetched")
        console.log(`❗️❗️❗️ `, yourGroup)
        console.log(`❗️❗️❗️ load`, yourGroup?.groupLoadDays[1].loads[0])
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
        <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />

        {hasLoads ? (
          <>
            {yourGroup?.groupLoadDays.map((day) => (
              <>
                <Text
                  key={day?.day}
                  preset="subheading"
                  text={day?.day || ""}
                  style={{ marginBottom: spacing.sm }}
                />

                {day?.loads?.length < 1 ? (
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
                      />
                    ))}
                  </>
                )}
              </>
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
          animationType="slide"
          transparent={true}
          visible={isScheduling}
          onRequestClose={() => {
            console.log("Modal has been closed")
          }}
        >
          <Screen
            preset="scroll"
            contentContainerStyle={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
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

              <View style={$buttonContainer}>
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
                    //TODO: reset form
                  }}
                />
              </View>
            </View>
          </Screen>
        </Modal>
      </Screen>
      <View style={$buttonContainer}>
        <Button
          preset="primary"
          style={$button}
          text="Schedule a Load"
          onPress={() => (isScheduling ? setIsScheduling(false) : setIsScheduling(true))}
        />
      </View>
    </>
  )
}

const $container: ViewStyle = {
  paddingTop: spacing.xxs,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.xxl,
}

const $welcomeLogo: ImageStyle = {
  height: 88,
  marginBottom: spacing.lg,
  marginTop: spacing.sm,
  alignContent: "flex-start",
  marginLeft: -80,
}

const $oyster: ImageStyle = {
  height: 200,
  marginBottom: spacing.xxl,
  marginTop: spacing.sm,
  alignSelf: "center",
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}

const $buttonContainer: ViewStyle = {
  // marginBottom: spacing.md,
}
