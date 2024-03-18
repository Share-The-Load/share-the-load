import React, { FC, useEffect, useState } from "react"
import { ImageStyle, TextStyle, ViewStyle, Image, View, RefreshControl } from "react-native"
import { MainTabScreenProps } from "app/navigators"
import { Button, Card, Screen, Text } from "app/components"
import { spacing } from "../theme"
import { useStores } from "../models"
import { getRandomNoLoadMessage } from "app/constants/noLoadMessages"

const welcomeLogo = require("../../assets/images/shareTheLoadLogo.png")
const oysterLogo = require("../../assets/images/oyster.png")

export const HomeScreen: FC<MainTabScreenProps<"Home">> = function HomeScreen(_props) {
  const {
    groupStore: { getLoads, yourGroup, hasLoads },
    authenticationStore: { validateAndRefreshToken },
  } = useStores()

  const [refreshing, setRefreshing] = useState(false)

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
                        style={{ marginBottom: spacing.sm }}
                        LeftComponent={
                          <Image
                            source={oysterLogo}
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
      </Screen>
      <View style={$buttonContainer}>
        <Button
          preset="primary"
          style={$button}
          text="Schedule a Load"
          onPress={() => console.log("schedule")}
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
