import React, { FC, Fragment, useCallback, useEffect, useState } from "react";
import {
  ImageStyle,
  TextStyle,
  ViewStyle,
  Image,
  View,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { MainTabScreenProps } from "app/navigators";
import {
  Card,
  DataLoader,
  Icon,
  Screen,
  Text,
} from "app/components";
import { colors, spacing } from "../theme";
import { useAuthStore, useScheduleStore } from "../store";
import { api } from "app/services/api";
import { getRandomNoLoadMessage } from "app/constants/noLoadMessages";
import { getLoadImage } from "app/constants/images";
import type { GroupDay } from "app/services/api/api.types";
import moment from "moment";
var { height } = Dimensions.get("window");

const stlLogo = require("../../assets/images/logo.png");
const oysterLogo = require("../../assets/images/oyster.png");

function formatLoadTime(start_time: string, end_time: string) {
  const start = moment(start_time).format("h:mm A");
  const end = moment(end_time).format("h:mm A");
  return `${start} - ${end}`;
}

export const HomeScreen: FC<MainTabScreenProps<"Home">> = function HomeScreen(
  _props,
) {
  const { distributeAuthToken, userId } = useAuthStore();

  const setOnScheduleComplete = useScheduleStore((s) => s.setOnScheduleComplete);

  const [refreshing, setRefreshing] = useState(false);
  const refetchRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    setOnScheduleComplete(() => refetchRef.current?.());
    return () => setOnScheduleComplete(null);
  }, [setOnScheduleComplete]);

  const fetchLoads = useCallback(async (): Promise<GroupDay[]> => {
    distributeAuthToken();
    const response = await api.getLoadsHome();
    if (response.kind === "ok" && response.days) {
      return response.days;
    }
    throw new Error("Failed to load scheduled loads");
  }, []);

  return (
    <DataLoader queryFn={fetchLoads} loadingMessage="Loading loads...">
      {(days, refetch) => {
        refetchRef.current = refetch;
        const hasLoads = days.some((day) => day.loads.length > 0);

        const onRefresh = () => {
          setRefreshing(true);
          refetch();
          setRefreshing(false);
        };

        function deleteLoadFunction(loadId: number) {
          api
            .deleteLoad(loadId)
            .then(() => refetch())
            .catch((error) => console.error("Error deleting load", error));
        }

        return (
          <>
            <Screen
              preset="scroll"
              safeAreaEdges={["top"]}
              contentContainerStyle={$container}
              ScrollViewProps={{
                refreshControl: (
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                ),
              }}
            >
              <Image
                style={$welcomeLogo}
                source={stlLogo}
                resizeMode="contain"
              />

              {hasLoads ? (
                <>
                  {days.map((day) => (
                    <Fragment key={day.day}>
                      <View style={$dayHeader}>
                        <Text
                          preset="subheading"
                          text={day.day || ""}
                          style={$dayHeaderText}
                        />
                      </View>

                      {!day.loads.length ? (
                        <View style={$noLoadsContainer}>
                          <Text
                            preset="default"
                            text={getRandomNoLoadMessage()}
                            key={day.day + "noLoads"}
                            style={$noLoadsText}
                          />
                        </View>
                      ) : (
                        <>
                          {day.loads.map((load) => (
                            <Card
                              key={load.load_id}
                              heading={load.loadMember.username || ""}
                              content={formatLoadTime(
                                load.start_time,
                                load.end_time,
                              )}
                              footer={load.load_type || ""}
                              style={$loadCard}
                              LeftComponent={
                                <Image
                                  source={getLoadImage(load.load_type)}
                                  style={$loadImage}
                                />
                              }
                              RightComponent={
                                <>
                                  {load.loadMember.user_id === userId && (
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
                                              onPress: () =>
                                                console.log("Cancel Pressed"),
                                              style: "cancel",
                                            },
                                            {
                                              text: "Delete",
                                              onPress: () =>
                                                deleteLoadFunction(
                                                  load.load_id,
                                                ),
                                            },
                                          ],
                                          { cancelable: false },
                                        );
                                      }}
                                    />
                                  )}
                                </>
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
                  <Image
                    style={$oyster}
                    source={oysterLogo}
                    resizeMode="contain"
                  />
                </>
              )}
            </Screen>
          </>
        );
      }}
    </DataLoader>
  );
};

const $container: ViewStyle = {
  paddingTop: spacing.xxs,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
};

const $title: TextStyle = {
  marginBottom: spacing.lg,
  color: colors.palette.accent600,
};

const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.lg,
  marginTop: spacing.sm,
};

const $oyster: ImageStyle = {
  marginBottom: spacing.sm,
  marginTop: spacing.sm,
  height: height - 450,
  width: "100%",
  borderRadius: 16,
};

const $dayHeader: ViewStyle = {
  backgroundColor: colors.palette.primary50,
  borderRadius: 12,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.sm,
  marginTop: spacing.xs,
};

const $dayHeaderText: TextStyle = {
  color: colors.palette.primary800,
};

const $noLoadsContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.sm,
};

const $noLoadsText: TextStyle = {
  color: colors.palette.accent400,
  fontStyle: "italic",
};

const $loadCard: ViewStyle = {
  marginBottom: spacing.sm,
  alignItems: "center",
  borderRadius: 16,
  borderColor: colors.palette.neutral300,
};

const $loadImage: ImageStyle = {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginEnd: spacing.xs,
};

