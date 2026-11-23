import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const DURATION = 3000;

const SUCCESS_SOUND = require("../../assets/sounds/my_custom_sound.wav");

export default function ChecklistSuccessModal({ visible, onClose }: Props) {
  const { theme, isDark } = useTheme();

  const player = useAudioPlayer(SUCCESS_SOUND);

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const dotsScale = useRef(new Animated.Value(0)).current;

  const closedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeModal = () => {
    if (closedRef.current) return;

    closedRef.current = true;
    onCloseRef.current();
  };

  useEffect(() => {
    if (!visible) return;

    closedRef.current = false;

    setSeconds(3);

    scale.setValue(0);
    opacity.setValue(0);
    progress.setValue(1);
    dotsScale.setValue(0);

    // Success vibration
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );

    // Play success sound
    let active = true;

    const playSound = async () => {
      try {
        await player.seekTo(0);

        if (!active) return;

        player.volume = 0.7;
        player.play();
      } catch (error) {
        console.warn("Unable to play success sound:", error);
      }
    };

    void playSound();

    // Popup entrance animation
    const entrance = Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 65,
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),

      Animated.timing(dotsScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]);

    entrance.start();

    // Countdown progress bar
    const countdownAnimation = Animated.timing(progress, {
      toValue: 0,
      duration: DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    countdownAnimation.start();

    const interval = setInterval(() => {
      setSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);

    // Automatically navigate after 3 seconds
    const timeout = setTimeout(() => {
      if (!closedRef.current) {
        closedRef.current = true;
        onCloseRef.current();
      }
    }, DURATION);

    return () => {
      active = false;

      clearInterval(interval);
      clearTimeout(timeout);

      entrance.stop();
      countdownAnimation.stop();

      try {
        player.pause();
      } catch {
        // Audio failure must not affect navigation
      }
    };
  }, [visible, player, scale, opacity, progress, dotsScale]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          {/* Exact finalized success icon */}

          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: dotsScale }],
              },
            ]}
          >
            <Svg width={110} height={110} viewBox="0 0 120 120">
              {Array.from({ length: 12 }).map((_, index) => (
                <Circle
                  key={index}
                  cx={60 + 52 * Math.cos((index * Math.PI) / 6)}
                  cy={60 + 52 * Math.sin((index * Math.PI) / 6)}
                  r={index % 2 === 0 ? 2.4 : 1.5}
                  fill={["#16A34A", "#EAB308", "#86EFAC"][index % 3]}
                />
              ))}

              <Circle cx={60} cy={60} r={43} fill="#22C55E" opacity={0.12} />

              <Circle cx={60} cy={60} r={33} fill="#16A34A" />

              <Path
                d="M44 60 L55 71 L77 48"
                stroke="#FFFFFF"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Success title */}

          <Text
            style={[
              styles.title,
              {
                color: isDark ? "#4ADE80" : "#16A34A",
              },
            ]}
          >
            Service Completed Successfully!
          </Text>

          {/* Tagline */}

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.text,
              },
            ]}
          >
            A cleaner home. A happier you.
          </Text>

          {/* Thank-you message */}

          <Text
            style={[
              styles.description,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Thank you for choosing Neatify! Your feedback helps us serve you
            better.
          </Text>

          {/* Explore More Services */}

          <TouchableOpacity
            style={styles.exploreButton}
            activeOpacity={0.85}
            onPress={closeModal}
            accessibilityRole="button"
          >
            <Text style={styles.exploreButtonText}>Explore More Services</Text>
          </TouchableOpacity>

          {/* Countdown text */}

          <Text
            style={[
              styles.countdownText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Redirecting to Home in {seconds}{" "}
            {seconds === 1 ? "second" : "seconds"}...
          </Text>

          {/* Green countdown bar */}

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },

  iconContainer: {
    marginBottom: 16,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },

  exploreButton: {
    width: "100%",
    backgroundColor: "#F4C430",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  exploreButtonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
  },

  countdownText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 10,
  },

  progressTrack: {
    width: "100%",
    height: 5,
    borderRadius: 10,
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 10,
  },
});
