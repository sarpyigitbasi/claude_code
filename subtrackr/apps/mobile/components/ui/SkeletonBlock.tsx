import { useEffect } from 'react'
import { AccessibilityInfo, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated'
import { colors } from '../../lib/theme'
import { useColorScheme } from 'react-native'

interface SkeletonBlockProps {
  width: number | string
  height: number
  borderRadius?: number
}

export function SkeletonBlock({ width, height, borderRadius = 8 }: SkeletonBlockProps) {
  const colorScheme = useColorScheme()
  const palette = colorScheme === 'dark' ? colors.dark : colors.light
  const opacity = useSharedValue(1)

  useEffect(() => {
    // Respect prefers-reduced-motion (UI-SPEC accessibility requirement)
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!reduceMotion) {
        // Shimmer: opacity 1.0 -> 0.4 -> 1.0 at 1200ms loop (UI-SPEC animation contract)
        opacity.value = withRepeat(
          withTiming(0.4, { duration: 600 }),
          -1,
          true
        )
      } else {
        opacity.value = 0.7
      }
    })

    return () => {
      cancelAnimation(opacity)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: palette.surfaceElevated,
        },
        animatedStyle,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  )
}
