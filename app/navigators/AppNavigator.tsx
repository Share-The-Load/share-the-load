/**
 * The app navigator is used for the primary navigation flows of your app.
 * It contains an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { useColorScheme } from "react-native"
import * as Screens from "app/screens"
import Config from "../config"
import { useAuthStore } from "../store"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { colors } from "app/theme"
import { MainNavigator, MainNavigatorParamList } from "./MainNavigator"

export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  Main: NavigatorScreenParams<MainNavigatorParamList>
  Group: { mode: "find" | "create" }
  Register: undefined
  Profile: undefined
  GroupHome: undefined
  ForgotPassword: undefined
}

const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

const Stack = createNativeStackNavigator<AppStackParamList>()

function AppStack() {
  const isAuthenticated = useAuthStore((s) => !!s.authToken)
  const hasGroup = useAuthStore((s) => !!s.userGroupId)
  const isValidated = useAuthStore((s) => s.validated)

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
      initialRouteName={isAuthenticated && hasGroup ? "Welcome" : "Login"}
    >
      {isAuthenticated && hasGroup && isValidated ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
        </>
      ) : isAuthenticated && !hasGroup && isValidated ? (
        <>
          <Stack.Screen name="Welcome" component={Screens.WelcomeScreen} />
          <Stack.Screen name="Group" component={Screens.GroupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Screens.LoginScreen} />
          <Stack.Screen name="Register" component={Screens.RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={Screens.ForgotPasswordScreen} />
        </>
      )}

      <Stack.Screen name="Profile" component={Screens.ProfileScreen} />
      <Stack.Screen name="GroupHome" component={Screens.GroupHomeScreen} />
    </Stack.Navigator>
  )
}

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
}
