import { useFonts } from "expo-font";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { AppNavigator, useNavigationPersistence } from "./navigators";
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary";
import * as storage from "./utils/storage";
import { colors, customFontsToLoad, spacing } from "./theme";
import Config from "./config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Alert,
  Modal,
  Pressable,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "./components";
import * as Linking from "expo-linking";
import { useAuthStore } from "./store";
import { api } from "./services/api";
import { AnimatedSplashScreen } from "./components/AnimatedSplashScreen";

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE";

interface AppProps {
  hideSplashScreen: () => Promise<boolean | void>;
}

function App(props: AppProps) {
  const { hideSplashScreen } = props;
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY);

  const validateAndRefreshToken = useAuthStore((s) => s.validateAndRefreshToken);
  const authToken = useAuthStore((s) => s.authToken);
  const userGroupId = useAuthStore((s) => s.userGroupId);
  const setUserGroupId = useAuthStore((s) => s.setUserGroupId);
  const pendingInviteCode = useAuthStore((s) => s.pendingInviteCode);
  const setPendingInviteCode = useAuthStore((s) => s.setPendingInviteCode);

  const [areFontsLoaded] = useFonts(customFontsToLoad);
  const [isReady, setIsReady] = useState(false);

  // Passcode prompt modal state
  const [passcodeModalVisible, setPasscodeModalVisible] = useState(false);
  const [passcodeModalGroupName, setPasscodeModalGroupName] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const passcodeInviteCodeRef = useRef("");

  function dismissPasscodeModal() {
    setPasscodeModalVisible(false);
    setPasscodeInput("");
    passcodeInviteCodeRef.current = "";
  }

  async function submitPasscode() {
    const code = passcodeInviteCodeRef.current;
    const passcode = passcodeInput;
    dismissPasscodeModal();

    if (!passcode) return;

    const { distributeAuthToken } = useAuthStore.getState();
    distributeAuthToken();
    const retryResult = await api.joinGroupByInvite(code, passcode);
    if (retryResult.kind === "ok" && retryResult.group) {
      setUserGroupId(retryResult.group.group_id);
      Alert.alert("Joined!", `You are now a member of "${retryResult.group.name}"`);
    } else {
      Alert.alert("Error", "Invalid passcode.");
    }
  }

  const handleInviteCode = useCallback(async (code: string) => {
    const { distributeAuthToken } = useAuthStore.getState();

    // If not authenticated, store for later
    if (!useAuthStore.getState().authToken) {
      setPendingInviteCode(code);
      return;
    }

    // If already in a group, show alert
    if (useAuthStore.getState().userGroupId) {
      Alert.alert("Already in a group", "You must leave your current group before joining a new one.");
      return;
    }

    distributeAuthToken();
    const result = await api.joinGroupByInvite(code);
    if (result.kind !== "ok") {
      Alert.alert("Error", "Could not join group. The invite link may be invalid.");
      return;
    }

    if (result.requiresPasscode) {
      passcodeInviteCodeRef.current = code;
      setPasscodeModalGroupName(result.groupName ?? "this group");
      setPasscodeInput("");
      setPasscodeModalVisible(true);
      return;
    }

    if (result.group) {
      setUserGroupId(result.group.group_id);
      Alert.alert("Joined!", `You are now a member of "${result.group.name}"`);
    }
  }, []);

  function extractInviteCode(url: string): string | null {
    // Handle share-the-load://invite/{code}
    const match = url.match(/invite\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  // Handle deep links
  useEffect(() => {
    // Cold start
    Linking.getInitialURL().then((url) => {
      if (url) {
        const code = extractInviteCode(url);
        if (code) handleInviteCode(code);
      }
    });

    // Warm start
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const code = extractInviteCode(url);
      if (code) handleInviteCode(code);
    });

    return () => subscription.remove();
  }, [handleInviteCode]);

  // Process pending invite code after login
  useEffect(() => {
    if (authToken && pendingInviteCode && !userGroupId) {
      const code = pendingInviteCode;
      setPendingInviteCode(undefined);
      handleInviteCode(code);
    }
  }, [authToken, pendingInviteCode, userGroupId]);

  useEffect(() => {
    (async () => {
      await validateAndRefreshToken();
      setIsReady(true);
      setTimeout(hideSplashScreen, 500);
    })();
  }, []);

  if (!isReady || !isNavigationStateRestored || !areFontsLoaded) return null;

  const isBootstrapped =
    isNavigationStateRestored &&
    (areFontsLoaded || !!areFontsLoaded) &&
    isReady;

  return (
    <AnimatedSplashScreen isReady={isBootstrapped}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <GestureHandlerRootView style={$container}>
            <AppNavigator
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
            <Modal
              visible={passcodeModalVisible}
              transparent
              animationType="fade"
              onRequestClose={dismissPasscodeModal}
            >
              <View style={$modalOverlay}>
                <View style={$modalCard}>
                  <Text preset="subheading" style={$modalTitle} text="Passcode Required" />
                  <Text
                    style={$modalMessage}
                    text={`Enter the passcode for "${passcodeModalGroupName}"`}
                  />
                  <TextInput
                    style={$modalInput}
                    value={passcodeInput}
                    onChangeText={setPasscodeInput}
                    secureTextEntry
                    autoFocus
                    placeholder="Passcode"
                    placeholderTextColor={colors.textDim}
                    onSubmitEditing={submitPasscode}
                    returnKeyType="done"
                  />
                  <View style={$modalButtons}>
                    <Pressable style={$modalButton} onPress={dismissPasscodeModal}>
                      <Text style={$modalButtonTextCancel} text="Cancel" />
                    </Pressable>
                    <Pressable style={$modalButton} onPress={submitPasscode}>
                      <Text style={$modalButtonTextJoin} text="Join" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </SafeAreaProvider>
    </AnimatedSplashScreen>
  );
}

export default App;

const $container: ViewStyle = {
  flex: 1,
};

const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
};

const $modalCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 14,
  padding: spacing.lg,
  width: "100%",
  maxWidth: 340,
};

const $modalTitle: TextStyle = {
  marginBottom: spacing.xs,
  textAlign: "center",
};

const $modalMessage: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.md,
  fontSize: 14,
};

const $modalInput: ViewStyle & TextStyle = {
  borderWidth: 1,
  borderColor: colors.separator,
  borderRadius: 8,
  padding: spacing.sm,
  fontSize: 16,
  marginBottom: spacing.md,
  color: colors.text,
};

const $modalButtons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: spacing.md,
};

const $modalButton: ViewStyle = {
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
};

const $modalButtonTextCancel: TextStyle = {
  color: colors.textDim,
  fontSize: 16,
  fontWeight: "600",
};

const $modalButtonTextJoin: TextStyle = {
  color: colors.palette.primary700,
  fontSize: 16,
  fontWeight: "600",
};
