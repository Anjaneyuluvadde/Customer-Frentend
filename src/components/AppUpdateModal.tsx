import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { AppVersionCheckResult } from "../services/appVersionService";

interface AppUpdateModalProps {
  visible: boolean;
  updateInfo: AppVersionCheckResult | null;
  onLater: () => void;
}

const FALLBACK_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.theneatifyteam.app";

export default function AppUpdateModal({
  visible,
  updateInfo,
  onLater,
}: AppUpdateModalProps) {
  const [openingStore, setOpeningStore] = useState(false);

  if (!updateInfo || !updateInfo.updateAvailable) {
    return null;
  }

  const mandatory = updateInfo.mandatory;

  const handleUpdate = async () => {
    if (openingStore) return;

    setOpeningStore(true);

    try {
      const configuredUrl = updateInfo.playStoreUrl?.trim();

      const storeUrl = configuredUrl?.startsWith(
        "https://play.google.com/store/apps/details",
      )
        ? configuredUrl
        : FALLBACK_PLAY_STORE_URL;

      await Linking.openURL(storeUrl);
    } catch (error) {
      console.error("[AppUpdate] Failed to open Play Store:", error);
    } finally {
      setOpeningStore(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!mandatory) onLater();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={mandatory ? "alert-circle" : "cloud-download"}
              size={42}
              color="#111827"
            />
          </View>

          <Text style={styles.title}>
            {mandatory ? "Update Required" : "New Update Available!"}
          </Text>

          <Text style={styles.message}>{updateInfo.message}</Text>

          <View style={styles.versionContainer}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Installed Version</Text>
              <Text style={styles.versionValue}>
                {updateInfo.installedVersion}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Latest Version</Text>
              <Text style={styles.versionValue}>
                {updateInfo.latestVersion ?? "Available"}
              </Text>
            </View>
          </View>

          {mandatory && (
            <Text style={styles.requiredText}>
              Please update the app to continue using The Neatify Team.
            </Text>
          )}

          <Pressable
            style={[styles.updateButton, openingStore && styles.disabledButton]}
            disabled={openingStore}
            onPress={handleUpdate}
          >
            {openingStore ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <>
                <Ionicons
                  name="logo-google-playstore"
                  size={20}
                  color="#111827"
                />
                <Text style={styles.updateButtonText}>Update Now</Text>
              </>
            )}
          </Pressable>

          {!mandatory && (
            <Pressable style={styles.laterButton} onPress={onLater}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
    elevation: 12,
  },

  iconContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#F4C430",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },

  message: {
    fontSize: 15,
    lineHeight: 23,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 18,
  },

  versionContainer: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    padding: 16,
    marginBottom: 18,
  },

  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  versionLabel: {
    fontSize: 13,
    color: "#6B7280",
  },

  versionValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  requiredText: {
    color: "#B45309",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 18,
  },

  updateButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#F4C430",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  updateButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  disabledButton: {
    opacity: 0.6,
  },

  laterButton: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },

  laterButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
});
