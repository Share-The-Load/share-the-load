import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { runOnJS } from "react-native-worklets";

const splashImage = require("../../assets/images/splash.png");
const logoImage = require("../../assets/images/logo_white.png");

SplashScreen.preventAutoHideAsync();

interface AnimatedSplashScreenProps extends PropsWithChildren {
  isReady: boolean;
}

export function AnimatedSplashScreen({
  children,
  isReady,
}: AnimatedSplashScreenProps) {
  const [splashHidden, setSplashHidden] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoTranslateY = useSharedValue(20);
  const splashOpacity = useSharedValue(1);

  const onAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  useEffect(() => {
    if (isReady && !splashHidden) {
      SplashScreen.hideAsync().then(() => {
        setSplashHidden(true);

        // Logo entrance animation
        logoOpacity.value = withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });
        logoScale.value = withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
        });
        logoTranslateY.value = withTiming(0, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });

        // Fade out the whole splash after logo has been visible
        splashOpacity.value = withDelay(
          1600,
          withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }),
        );

        // Signal animation complete
        setTimeout(() => {
          runOnJS(onAnimationComplete)();
        }, 2200);
      });
    }
  }, [isReady, splashHidden]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {children}
      {!animationComplete && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.splashContainer,
            overlayStyle,
          ]}
          pointerEvents="none"
        >
          <Animated.Image
            source={splashImage}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
          <Animated.Image
            source={logoImage}
            style={[styles.logo, logoStyle]}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    backgroundColor: "#D7CEC9",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  logo: {
    width: "75%",
    height: 80,
  },
});
