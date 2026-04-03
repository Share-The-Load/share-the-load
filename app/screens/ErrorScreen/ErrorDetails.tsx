import React, { ErrorInfo } from "react";
import {
  Image,
  ImageStyle,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Button, Screen, Text } from "../../components";
import { colors, spacing } from "../../theme";

const bugHeader = require("../../../assets/images/bug_header.png");

export interface ErrorDetailsProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset(): void;
}

export function ErrorDetails(props: ErrorDetailsProps) {
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={$contentContainer}
    >
      <View style={$topSection}>
        <Image source={bugHeader} style={$headerImage} resizeMode="cover" />
        <Text style={$heading} preset="subheading" text="Uh oh, lost a sock!" />
        <Text
          style={$subtitle}
          text="Something got tangled up in the spin cycle. Don't worry — no laundry was harmed."
        />
      </View>

      <ScrollView
        style={$errorSection}
        contentContainerStyle={$errorSectionContentContainer}
      >
        <Text
          style={$errorContent}
          weight="bold"
          text={`${props.error}`.trim()}
        />
        <Text
          selectable
          style={$errorBacktrace}
          text={`${props.errorInfo?.componentStack ?? ""}`.trim()}
        />
      </ScrollView>

      <Button
        preset="reversed"
        style={$resetButton}
        onPress={props.onReset}
        text="RESTART THE WASH"
      />
    </Screen>
  );
}

const $contentContainer: ViewStyle = {
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  flex: 1,
};

const $topSection: ViewStyle = {
  alignItems: "center",
  width: "100%",
};

const $headerImage: ImageStyle = {
  width: "100%",
  height: 180,
  borderRadius: 8,
  marginBottom: spacing.md,
};

const $heading: TextStyle = {
  color: colors.error,
  marginBottom: spacing.xs,
};

const $subtitle: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.sm,
  color: colors.textDim,
};

const $errorSection: ViewStyle = {
  flex: 2,
  backgroundColor: colors.separator,
  marginVertical: spacing.md,
  borderRadius: 6,
};

const $errorSectionContentContainer: ViewStyle = {
  padding: spacing.md,
};

const $errorContent: TextStyle = {
  color: colors.error,
};

const $errorBacktrace: TextStyle = {
  marginTop: spacing.md,
  color: colors.textDim,
};

const $resetButton: ViewStyle = {
  backgroundColor: colors.error,
  paddingHorizontal: spacing.xxl,
};
