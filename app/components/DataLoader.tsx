import React, { useEffect, useState, useCallback } from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "./Text"
import { FullScreenLoader } from "./FullScreenLoader"
import { colors, spacing } from "../theme"

interface DataLoaderProps<T> {
  queryFn: () => Promise<T>
  children: (data: T, refetch: () => void) => React.ReactNode
  loadingMessage?: string
}

export function DataLoader<T>({ queryFn, children, loadingMessage }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback((isRefetch = false) => {
    if (!isRefetch) setLoading(true)
    setError(null)
    queryFn()
      .then((result) => setData(result))
      .catch((e) => setError(e?.message ?? "Something went wrong"))
      .finally(() => setLoading(false))
  }, [queryFn])

  useEffect(() => {
    fetch()
  }, [fetch])

  if (loading) {
    return <FullScreenLoader message={loadingMessage} />
  }

  if (error) {
    return (
      <View style={$errorContainer}>
        <Text preset="subheading" text="Something went wrong" style={$errorTitle} />
        <Text text={error} style={$errorText} />
      </View>
    )
  }

  if (data == null) {
    return (
      <View style={$errorContainer}>
        <Text preset="subheading" text="No data available" style={$errorTitle} />
      </View>
    )
  }

  return <>{children(data, () => fetch(true))}</>
}

const $errorContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
}

const $errorTitle = {
  color: colors.error,
  marginBottom: spacing.sm,
} as const

const $errorText = {
  color: colors.textDim,
  textAlign: "center" as const,
} as const
