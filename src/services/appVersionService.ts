import * as Application from "expo-application";
import { Platform } from "react-native";

// ------------------------------------------------------------
// FASTAPI BACKEND CONFIGURATION
// ------------------------------------------------------------

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  ""
)
  .trim()
  .replace(/\/+$/, "");

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

export interface AppVersionConfig {
  latest_version: string;
  latest_version_code: number;
  minimum_version_code: number;
  update_policy: "optional" | "mandatory";
  update_message: string | null;
  update_enabled: boolean;
  play_store_url: string | null;
}

export interface AppVersionCheckResult {
  updateAvailable: boolean;
  mandatory: boolean;
  installedVersion: string;
  installedVersionCode: number | null;
  latestVersion: string | null;
  latestVersionCode: number | null;
  message: string;
  playStoreUrl: string | null;
}

// ------------------------------------------------------------
// DEFAULT MESSAGE
// ------------------------------------------------------------

const DEFAULT_MESSAGE =
  "A new version of The Neatify Team is available. Please update from Google Play.";

// ------------------------------------------------------------
// CUSTOMER APP VERSION CHECK
// ------------------------------------------------------------

export async function checkCustomerAppVersion(): Promise<AppVersionCheckResult> {
  // Read installed application version from Android
  const installedVersion = Application.nativeApplicationVersion ?? "Unknown";

  // Read installed Android version code
  const rawBuildCode = Application.nativeBuildVersion;

  const parsedBuildCode = rawBuildCode ? Number(rawBuildCode) : NaN;

  const installedVersionCode =
    Number.isSafeInteger(parsedBuildCode) && parsedBuildCode > 0
      ? parsedBuildCode
      : null;

  // Default result when no update is detected
  const defaultResult: AppVersionCheckResult = {
    updateAvailable: false,
    mandatory: false,
    installedVersion,
    installedVersionCode,
    latestVersion: null,
    latestVersionCode: null,
    message: DEFAULT_MESSAGE,
    playStoreUrl: null,
  };

  // ------------------------------------------------------------
  // ANDROID CHECK
  // ------------------------------------------------------------

  if (Platform.OS !== "android") {
    return defaultResult;
  }

  if (installedVersionCode === null) {
    console.warn("[AppVersion] Unable to read installed Android version code.");

    return defaultResult;
  }

  // ------------------------------------------------------------
  // BACKEND URL VALIDATION
  // ------------------------------------------------------------

  if (!API_BASE_URL) {
    console.error("[AppVersion] EXPO_PUBLIC_API_URL is not configured.");

    return defaultResult;
  }

  try {
    // ----------------------------------------------------------
    // CALL FASTAPI BACKEND
    // ----------------------------------------------------------

    const url =
      `${API_BASE_URL}/api/v1/customer/app-version/check` +
      `?installed_version_code=${installedVersionCode}` +
      `&installed_version=${encodeURIComponent(installedVersion)}`;

    console.log("[AppVersion] Checking application update through FastAPI.");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // ----------------------------------------------------------
    // HANDLE HTTP ERRORS
    // ----------------------------------------------------------

    if (!response.ok) {
      console.error(
        `[AppVersion] FastAPI request failed: HTTP ${response.status}`,
      );

      return defaultResult;
    }

    // ----------------------------------------------------------
    // READ BACKEND RESPONSE
    // ----------------------------------------------------------

    const data: Partial<AppVersionCheckResult> = await response.json();

    if (!data || typeof data.updateAvailable !== "boolean") {
      console.warn("[AppVersion] Invalid FastAPI response.");

      return defaultResult;
    }

    // ----------------------------------------------------------
    // NO UPDATE AVAILABLE
    // ----------------------------------------------------------

    if (!data.updateAvailable) {
      console.log(
        "[AppVersion] Application is up to date or updates are disabled.",
      );

      return defaultResult;
    }

    // ----------------------------------------------------------
    // VALIDATE VERSION INFORMATION
    // ----------------------------------------------------------

    const latestVersionCode = Number(data.latestVersionCode);

    if (
      !Number.isSafeInteger(latestVersionCode) ||
      latestVersionCode <= installedVersionCode ||
      typeof data.mandatory !== "boolean"
    ) {
      console.warn("[AppVersion] Invalid update information received.");

      return defaultResult;
    }

    // ----------------------------------------------------------
    // BACKEND UPDATE DECISION
    // ----------------------------------------------------------

    const mandatory = data.mandatory;

    console.log("[AppVersion] Update available:", {
      installedVersion,
      installedVersionCode,
      latestVersion: data.latestVersion,
      latestVersionCode,
      mandatory,
    });

    // ----------------------------------------------------------
    // RETURN UPDATE DETAILS TO APP.TSX
    // ----------------------------------------------------------

    return {
      updateAvailable: true,
      mandatory,
      installedVersion,
      installedVersionCode,
      latestVersion:
        typeof data.latestVersion === "string" ? data.latestVersion : null,
      latestVersionCode,
      message:
        typeof data.message === "string" && data.message.trim()
          ? data.message.trim()
          : DEFAULT_MESSAGE,
      playStoreUrl:
        typeof data.playStoreUrl === "string" ? data.playStoreUrl : null,
    };
  } catch (error) {
    console.error("[AppVersion] Unexpected FastAPI error:", error);

    return defaultResult;
  }
}
