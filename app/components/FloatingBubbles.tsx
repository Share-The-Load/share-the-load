import React, { useEffect } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

interface Bubble {
  id: number
  size: number
  color: string
  startX: number
  startY: number
  endY: number
  driftX: number
  duration: number
  delay: number
}

const BUBBLE_COLORS = [
  "rgba(63, 151, 222, 0.15)",
  "rgba(46, 120, 191, 0.12)",
  "rgba(150, 202, 238, 0.2)",
  "rgba(112, 181, 231, 0.18)",
  "rgba(85, 165, 226, 0.14)",
  "rgba(145, 150, 185, 0.12)",
  "rgba(189, 222, 245, 0.2)",
  "rgba(39, 103, 173, 0.1)",
]

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 20 + Math.random() * 80,
    color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
    startX: Math.random() * SCREEN_WIDTH,
    startY: SCREEN_HEIGHT + 50 + Math.random() * 200,
    endY: -150 - Math.random() * 100,
    driftX: (Math.random() - 0.5) * 120,
    duration: 6000 + Math.random() * 8000,
    delay: Math.random() * 4000,
  }))
}

function BubbleItem({ bubble }: { bubble: Bubble }) {
  const translateY = useSharedValue(0)
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.3)

  useEffect(() => {
    translateY.value = withDelay(
      bubble.delay,
      withRepeat(
        withTiming(bubble.endY - bubble.startY, {
          duration: bubble.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        false,
      ),
    )

    translateX.value = withDelay(
      bubble.delay,
      withRepeat(
        withTiming(bubble.driftX, {
          duration: bubble.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    )

    opacity.value = withDelay(
      bubble.delay,
      withRepeat(
        withTiming(1, {
          duration: bubble.duration * 0.3,
          easing: Easing.out(Easing.cubic),
        }),
        -1,
        false,
      ),
    )

    scale.value = withDelay(
      bubble.delay,
      withRepeat(
        withTiming(1, {
          duration: bubble.duration * 0.4,
          easing: Easing.out(Easing.back(1.5)),
        }),
        -1,
        false,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: bubble.startX,
          top: bubble.startY,
          width: bubble.size,
          height: bubble.size,
          borderRadius: bubble.size / 2,
          backgroundColor: bubble.color,
        },
        animatedStyle,
      ]}
    />
  )
}

interface FloatingBubblesProps {
  count?: number
}

export function FloatingBubbles({ count = 14 }: FloatingBubblesProps) {
  const bubbles = React.useMemo(() => generateBubbles(count), [count])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {bubbles.map((bubble) => (
        <BubbleItem key={bubble.id} bubble={bubble} />
      ))}
    </View>
  )
}
