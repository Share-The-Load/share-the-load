import React, { FC, useCallback } from "react"
import { ImageStyle, Text as RNText, TextStyle, View, ViewStyle } from "react-native"
import { MainTabScreenProps } from "app/navigators"
import { DataLoader, Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useAuthStore } from "app/store"
import { api } from "app/services/api"
import type { InsightsData, LoadTypeCount, MemberLoadCount } from "app/services/api/api.types"

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export const InsightsScreen: FC<MainTabScreenProps<"Insights">> = function InsightsScreen(
  _props,
) {
  const { distributeAuthToken } = useAuthStore()

  const fetchInsights = useCallback(async (): Promise<InsightsData> => {
    distributeAuthToken()
    const response = await api.getInsights()
    if (response.kind === "ok") {
      return response.insights
    }
    throw new Error("Failed to load insights")
  }, [])

  return (
    <DataLoader queryFn={fetchInsights} loadingMessage="Loading insights...">
      {(data) => (
        <Screen
          preset="scroll"
          safeAreaEdges={["top"]}
          contentContainerStyle={$container}
        >
          <Text preset="heading" text="Insights" style={$heading} />

          {/* Your Stats */}
          <Text preset="subheading" text="Your Stats" style={$sectionTitle} />
          <View style={$statsRow}>
            <StatCard label="Total Loads" value={String(data.user.totalLoads)} />
            <StatCard label="Time Laundering" value={formatTime(data.user.totalMinutes)} />
          </View>

          {data.user.loadsByType.length > 0 && (
            <>
              <Text preset="default" text="By Type" style={$subLabel} />
              <View style={$typeList}>
                {data.user.loadsByType.map((item: LoadTypeCount) => (
                  <View key={item.type} style={$typeRow}>
                    <Text text={item.type} style={$typeLabel} />
                    <View style={$barContainer}>
                      <View
                        style={[
                          $bar,
                          {
                            width: `${Math.max(
                              (item.count / Math.max(data.user.totalLoads, 1)) * 100,
                              8,
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text text={String(item.count)} style={$typeCount} />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Group Stats */}
          <Text preset="subheading" text="Group Stats" style={$sectionTitle} />
          <View style={$statsRow}>
            <StatCard label="Total Loads" value={String(data.group.totalLoads)} />
            <StatCard label="Time Laundering" value={formatTime(data.group.totalMinutes)} />
          </View>

          {data.group.loadsByType.length > 0 && (
            <>
              <Text preset="default" text="By Type" style={$subLabel} />
              <View style={$typeList}>
                {data.group.loadsByType.map((item: LoadTypeCount) => (
                  <View key={item.type} style={$typeRow}>
                    <Text text={item.type} style={$typeLabel} />
                    <View style={$barContainer}>
                      <View
                        style={[
                          $bar,
                          {
                            width: `${Math.max(
                              (item.count / Math.max(data.group.totalLoads, 1)) * 100,
                              8,
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text text={String(item.count)} style={$typeCount} />
                  </View>
                ))}
              </View>
            </>
          )}

          {data.group.loadsPerMember.length > 0 && (
            <>
              <Text preset="default" text="Loads Per Member" style={$subLabel} />
              <View style={$memberGrid}>
                {(() => {
                  const maxCount = Math.max(...data.group.loadsPerMember.map((m) => m.count))
                  return data.group.loadsPerMember.map((member: MemberLoadCount) => (
                    <View key={member.username} style={$memberCard}>
                      {member.count === maxCount && member.count > 0 && (
                        <RNText style={$crownIcon}>{"👑"}</RNText>
                      )}
                      <Text
                        text={String(member.count)}
                        style={$memberCount}
                        numberOfLines={1}
                      />
                      <Text
                        text={member.username}
                        style={$memberName}
                        numberOfLines={1}
                      />
                    </View>
                  ))
                })()}
              </View>
            </>
          )}
        </Screen>
      )}
    </DataLoader>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={$statCard}>
      <Text text={value} style={$statValue} numberOfLines={1} adjustsFontSizeToFit />
      <Text text={label} style={$statLabel} />
    </View>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $heading: TextStyle = {
  marginBottom: spacing.md,
  marginTop: spacing.sm,
}

const $sectionTitle: TextStyle = {
  marginTop: spacing.lg,
  marginBottom: spacing.sm,
  color: colors.palette.primary800,
}

const $statsRow: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
  marginBottom: spacing.sm,
}

const $statCard: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
}

const $statValue: TextStyle = {
  fontSize: 26,
  lineHeight: 34,
  fontWeight: "bold",
  color: colors.tint,
}

const $statLabel: TextStyle = {
  fontSize: 13,
  color: colors.textDim,
  marginTop: spacing.xxs,
}

const $subLabel: TextStyle = {
  marginTop: spacing.sm,
  marginBottom: spacing.xs,
  color: colors.textDim,
}

const $typeList: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: spacing.sm,
}

const $typeRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
}

const $typeLabel: TextStyle = {
  width: 80,
  fontSize: 13,
  color: colors.text,
}

const $barContainer: ViewStyle = {
  flex: 1,
  height: 20,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 10,
  marginHorizontal: spacing.xs,
  overflow: "hidden",
}

const $bar: ViewStyle = {
  height: 20,
  backgroundColor: colors.tint,
  borderRadius: 10,
}

const $typeCount: TextStyle = {
  width: 30,
  textAlign: "right",
  fontSize: 13,
  fontWeight: "bold",
  color: colors.text,
}

const $memberGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
}

const $memberCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  alignItems: "center",
  minWidth: 90,
  flex: 1,
}

const $crownIcon: TextStyle = {
  fontSize: 18,
  marginBottom: 2,
}

const $memberCount: TextStyle = {
  fontSize: 22,
  lineHeight: 28,
  fontWeight: "bold",
  color: colors.palette.primary700,
}

const $memberName: TextStyle = {
  fontSize: 12,
  lineHeight: 16,
  color: colors.textDim,
  marginTop: spacing.xxs,
}
