import React from "react";

import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { colors, spacing, typography } from "app/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  GroupHomeScreen,
  HomeScreen,
  InsightsScreen,
  ProfileScreen,
} from "app/screens";
import { CompositeScreenProps } from "@react-navigation/native";
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator";
import { Icon } from "app/components/Icon";
import { ScheduleModal } from "app/components/ScheduleModal";
import { useScheduleStore } from "app/store";

export type MainNavigatorParamList = {
  Home: undefined;
  GroupHome: undefined;
  ScheduleLoad: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type MainTabScreenProps<T extends keyof MainNavigatorParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainNavigatorParamList, T>,
    AppStackScreenProps<keyof AppStackParamList>
  >;

const Tab = createBottomTabNavigator<MainNavigatorParamList>();

// Placeholder — never actually rendered since we intercept the tab press
function ScheduleLoadPlaceholder() {
  return <View />;
}

function ScheduleButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={$scheduleButtonWrapper} onPress={onPress} activeOpacity={0.8}>
      <View style={$scheduleButton}>
        <Text style={$scheduleButtonText}>+</Text>
      </View>
      <Text style={$scheduleButtonLabel}>Schedule</Text>
    </TouchableOpacity>
  );
}

export function MainNavigator() {
  const { bottom } = useSafeAreaInsets();
  const openScheduler = useScheduleStore((s) => s.openScheduler);

  return (
    <>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [$tabBar, { height: bottom + 70 }],
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: $tabBarLabel,
        tabBarItemStyle: $tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="home"
              color={focused ? colors.tint : undefined}
              size={30}
            />
          ),
        }}
      />
      <Tab.Screen
        name="GroupHome"
        component={GroupHomeScreen}
        options={{
          tabBarLabel: "Your Group",
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="users"
              color={focused ? colors.tint : undefined}
              size={30}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ScheduleLoad"
        component={ScheduleLoadPlaceholder}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            openScheduler();
          },
        }}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <ScheduleButton onPress={props.onPress as () => void} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: "Insights",
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="menu"
              color={focused ? colors.tint : undefined}
              size={25}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="person"
              color={focused ? colors.tint : undefined}
              size={25}
            />
          ),
        }}
      />
    </Tab.Navigator>
    <ScheduleModal />
    </>
  );
}

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
};

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.md,
};

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
};

const $scheduleButtonWrapper: ViewStyle = {
  top: -20,
  justifyContent: "center",
  alignItems: "center",
};

const $scheduleButton: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 8,
};

const $scheduleButtonText: TextStyle = {
  fontSize: 32,
  color: "#FFFFFF",
  fontWeight: "bold",
  lineHeight: 34,
};

const $scheduleButtonLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  marginTop: 4,
  color: colors.text,
};
