import React from "react"

import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { colors, spacing, typography } from "app/theme"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Image, ImageStyle, TextStyle, ViewStyle } from "react-native"
import { GroupHomeScreen, HomeScreen, ProfileScreen } from "app/screens"
import { Button, Icon } from "app/components"
import { CompositeScreenProps } from "@react-navigation/native"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
const avatar = require("../../assets/images/app-icon-all.png")

export type MainNavigatorParamList = {
  Home: undefined
  Profile: undefined
  GroupHome: undefined
}

export type MainTabScreenProps<T extends keyof MainNavigatorParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainNavigatorParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<MainNavigatorParamList>()

export function MainNavigator() {
  const { bottom } = useSafeAreaInsets()

  return (
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
            <Icon icon="home" color={focused ? colors.tint : undefined} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="GroupHome"
        component={GroupHomeScreen}
        options={{
          tabBarLabel: "Your Group",
          tabBarIcon: ({ focused }) => (
            <Icon icon="person" color={focused ? colors.tint : undefined} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <Icon icon="person" color={focused ? colors.tint : undefined} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
}

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.md,
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
}
const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}
