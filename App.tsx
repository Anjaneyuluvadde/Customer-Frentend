// import {
//   DarkTheme,
//   DefaultTheme,
//   NavigationContainer,
// } from "@react-navigation/native";
// import * as Linking from "expo-linking";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   Modal,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";

// import * as Notifications from "expo-notifications";
// import { BookingCartProvider } from "./src/context/BookingCartContext";
// import { LanguageProvider } from "./src/context/LanguageContext";
// import { NotificationProvider } from "./src/context/NotificationContext";
// import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
// import { supabase } from "./src/lib/supabase";
// import AppNavigator from "./src/navigation/AppNavigator";
// import {
//   registerForPushNotificationsAsync,
//   savePushTokenToSupabase,
// } from "./src/utils/pushNotifications";

// import { GestureHandlerRootView } from "react-native-gesture-handler";

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState<
//     "LocationAccess" | "Login" | "HomeDrawer" | "CompleteProfile"
//   >("Login");

//   const [loading, setLoading] = useState(true);
//   const [showGoogleLoadingPopup, setShowGoogleLoadingPopup] = useState(false);

//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const navigationRef = React.useRef<any>(null);
//   const skipAuthRedirect = React.useRef(false);
//   const googleAuthInProgress = React.useRef(false);

//   // ------------------------------------------------------------
//   // PUSH TOKEN
//   // ------------------------------------------------------------

//   const handlePushToken = async (userId: string) => {
//     try {
//       const token = await registerForPushNotificationsAsync();
//       if (token) {
//         await savePushTokenToSupabase(userId, token);
//       }
//     } catch (err) {
//       console.error("Push token registration failed:", err);
//     }
//   };

//   // ------------------------------------------------------------
//   // AUTH / APP INITIALIZATION
//   // ------------------------------------------------------------

//   useEffect(() => {
//     if (showGoogleLoadingPopup) {
//       Animated.loop(
//         Animated.timing(progressAnim, {
//           toValue: 1,
//           duration: 1200,
//           useNativeDriver: true,
//         }),
//       ).start();
//     }
//   }, [showGoogleLoadingPopup]);

//   useEffect(() => {
//     let hasCheckedOnce = false;

//     // ----------------------------------------------------------
//     // TIMEOUT HELPER
//     // ----------------------------------------------------------
//     const withTimeout = <T,>(
//       promise: PromiseLike<T>,
//       ms: number,
//       label: string,
//     ): Promise<T> => {
//       return Promise.race([
//         Promise.resolve(promise),
//         new Promise<T>((_, reject) =>
//           setTimeout(
//             () =>
//               reject(new Error(`Timeout: ${label} took longer than ${ms}ms`)),
//             ms,
//           ),
//         ),
//       ]);
//     };

//     // ----------------------------------------------------------
//     // CHECK PROFILE COMPLETENESS
//     // ----------------------------------------------------------
//     const checkCompleteness = async (
//       userId: string,
//       useNav = true,
//     ): Promise<boolean> => {
//       console.log("[AUTH DEBUG] checkCompleteness START for user:", userId);

//       if (!userId) {
//         console.log("[AUTH DEBUG] No userId, returning true");
//         return true;
//       }

//       try {
//         console.log("[AUTH DEBUG] supabase.auth.getUser() START");

//         const {
//           data: { user },
//           error: userError,
//         } = await withTimeout<any>(
//           supabase.auth.getUser(),
//           8000,
//           "supabase.auth.getUser",
//         );

//         if (userError || !user) {
//           if (
//             userError?.message?.includes("Refresh Token") ||
//             userError?.status === 401
//           ) {
//             await supabase.auth.signOut();
//           }
//           return true;
//         }

//         console.log("[AUTH DEBUG] profile query START");

//         const { data: profile } = await withTimeout<any>(
//           supabase
//             .from("profile")
//             .select("full_name, phone")
//             .eq("id", userId)
//             .maybeSingle(),
//           8000,
//           "profile query",
//         );

//         if (
//           profile &&
//           profile.full_name &&
//           profile.full_name.trim().length > 0
//         ) {
//           console.log("[AUTH DEBUG] Profile complete, returning true");
//           return true;
//         }

//         if (useNav) {
//           const rawPhone =
//             profile?.phone ||
//             user.phone ||
//             user.user_metadata?.phone_number ||
//             "";

//           const digits = rawPhone.replace(/\D/g, "").slice(-10);
//           // NEW FIX: Pass standard format to Complete Profile
//           const finalFormattedPhone = digits ? `+91${digits}` : "";

//           console.log(
//             "[AUTH DEBUG] Incomplete profile detected! Navigating to CompleteProfile screen...",
//           );

//           navigationRef.current?.reset({
//             index: 0,
//             routes: [
//               {
//                 name: "CompleteProfile",
//                 params: {
//                   initialData: {
//                     phone: finalFormattedPhone,
//                   },
//                 },
//               },
//             ],
//           });
//         }

//         return false;
//       } catch (err) {
//         console.error("[AUTH DEBUG] checkCompleteness catch error:", err);
//         return true;
//       }
//     };

//     // ----------------------------------------------------------
//     // INITIAL APP LAUNCH
//     // ----------------------------------------------------------
//     const initApp = async () => {
//       try {
//         const {
//           data: { session },
//           error: sessionError,
//         } = await supabase.auth.getSession();

//         if (sessionError) {
//           if (
//             sessionError.message?.includes("Refresh Token") ||
//             sessionError.status === 400
//           ) {
//             await supabase.auth.signOut();
//             setInitialRoute("Login");
//             setLoading(false);
//             return;
//           }
//           throw sessionError;
//         }

//         if (session?.user) {
//           handlePushToken(session.user.id);
//           hasCheckedOnce = true;
//           setInitialRoute("LocationAccess");
//         } else {
//           setInitialRoute("Login");
//         }
//       } catch (err) {
//         console.error("App init failed:", err);
//         setInitialRoute("Login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     initApp();

//     // ----------------------------------------------------------
//     // AUTH STATE LISTENER
//     // ----------------------------------------------------------
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         console.log(
//           "🌐 [App Debug] onAuthStateChange event:",
//           event,
//           "session user:",
//           session?.user?.id,
//         );

//         if (event === "SIGNED_OUT") {
//           skipAuthRedirect.current = false;
//           hasCheckedOnce = false;
//           googleAuthInProgress.current = false;
//           navigationRef.current?.reset({
//             index: 0,
//             routes: [{ name: "Login" }],
//           });
//           return;
//         }

//         if (skipAuthRedirect.current && event === "SIGNED_IN") {
//           return;
//         }

//         if (event === "SIGNED_IN" && session?.user && !hasCheckedOnce) {
//           hasCheckedOnce = true;
//           const userId = session.user.id;
//           handlePushToken(userId);

//           if (googleAuthInProgress.current) {
//             console.log("[AUTH] Google SIGNED_IN detected");
//             return;
//           }

//           // NEW FIX: Removed old redundant setTimeout routing.
//           // LoginScreen natively handles it now.
//           console.log("🌐 [App Debug] Standard login detected. Navigation is handled natively by LoginScreen.");
//         }
//       },
//     );

//     // ----------------------------------------------------------
//     // DEEP LINK HANDLER
//     // ----------------------------------------------------------
//     const handleDeepLink = async ({ url }: { url: string }) => {
//       if (!url) return;

//       if (url.includes("google-auth")) {
//         const fragment = url.split("#")[1];
//         if (!fragment) return;

//         const params = new URLSearchParams(fragment);
//         const accessToken = params.get("access_token");
//         const refreshToken = params.get("refresh_token");

//         if (!accessToken || !refreshToken) return;

//         googleAuthInProgress.current = true;
//         hasCheckedOnce = false;
//         setShowGoogleLoadingPopup(true);

//         try {
//           const { data, error } = await supabase.auth.setSession({
//             access_token: accessToken,
//             refresh_token: refreshToken,
//           });

//           if (error) {
//             googleAuthInProgress.current = false;
//             return;
//           }

//           if (data?.session?.user) {
//             const user = data.session.user;
//             const fullName =
//               user.user_metadata?.full_name ||
//               user.user_metadata?.name ||
//               user.email?.split("@")[0] ||
//               "Customer";

//             await supabase
//               .from("profile")
//               .upsert({
//                 id: user.id,
//                 email: user.email,
//                 full_name: fullName,
//                 phone: null,
//                 address: null,
//                 pincode: null,
//               });

//             setShowGoogleLoadingPopup(false);

//             const isComplete = await checkCompleteness(user.id, true);

//             if (isComplete) {
//               navigationRef.current?.reset({
//                 index: 0,
//                 routes: [{ name: "LocationAccess" }],
//               });
//             }

//             googleAuthInProgress.current = false;
//           } else {
//             googleAuthInProgress.current = false;
//             setShowGoogleLoadingPopup(false);
//           }
//         } catch (err) {
//           googleAuthInProgress.current = false;
//           setShowGoogleLoadingPopup(false);
//         }
//         return;
//       }

//       if (url.includes("reset-password") || url.includes("type=recovery")) {
//         skipAuthRedirect.current = true;
//         const searchPart = url.includes("#")
//           ? url.split("#")[1]
//           : url.split("?")[1];

//         if (searchPart) {
//           const params = new URLSearchParams(searchPart);
//           const accessToken = params.get("access_token");
//           const refreshToken = params.get("refresh_token");

//           if (accessToken && refreshToken) {
//             setTimeout(() => {
//               navigationRef.current?.reset({
//                 index: 0,
//                 routes: [
//                   {
//                     name: "ResetPassword",
//                     params: {
//                       access_token: accessToken,
//                       refresh_token: refreshToken,
//                     },
//                   },
//                 ],
//               });
//             }, 800);
//           }
//         }
//       }
//     };

//     Linking.getInitialURL().then((url) => {
//       if (url) {
//         handleDeepLink({ url });
//       }
//     });

//     const subscription = Linking.addEventListener("url", handleDeepLink);

//     const notificationResponseSubscription =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         const data = response.notification.request.content.data;
//         if (data?.screen === "bookings") {
//           navigationRef.current?.navigate("HomeDrawer", {
//             screen: "AuthenticatedScreens",
//             params: {
//               screen: "MainTabs",
//               params: {
//                 screen: "MyBookingsTab",
//               },
//             },
//           });
//         }
//       });

//     return () => {
//       listener.subscription.unsubscribe();
//       subscription.remove();
//       notificationResponseSubscription.remove();
//     };
//   }, []);

//   const linking: any = {
//     prefixes: [
//       Linking.createURL("/"),
//       "neatifynation://",
//       "theneatifyteam://",
//       "https://www.theneatifyteam.in",
//       "https://theneatifyteam.in",
//     ],
//     config: {
//       screens: {
//         HomeDrawer: {
//           screens: {
//             AuthenticatedScreens: {
//               screens: {
//                 MainTabs: {
//                   screens: {
//                     HomeTab: {
//                       screens: {
//                         ServiceDetail: "service/:serviceId",
//                         HomeMain: "*",
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     async getInitialURL() {
//       const url = await Linking.getInitialURL();
//       return url;
//     },
//     subscribe(listener: (url: string) => void) {
//       const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
//         listener(url);
//       });
//       return () => {
//         linkingSubscription.remove();
//       };
//     },
//   };

//   if (loading) {
//     return null;
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <ThemeProvider>
//           <LanguageProvider>
//             <NotificationProvider>
//               <BookingCartProvider>
//                 <ThemedAppContent
//                   linking={linking}
//                   navigationRef={navigationRef}
//                   initialRoute={initialRoute}
//                 />
//               </BookingCartProvider>
//             </NotificationProvider>
//           </LanguageProvider>
//         </ThemeProvider>
//       </SafeAreaProvider>
//       <Modal visible={showGoogleLoadingPopup} transparent animationType="fade">
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <View
//             style={{
//               width: 320,
//               backgroundColor: "#fff",
//               borderRadius: 16,
//               padding: 24,
//               alignItems: "center",
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 16,
//                 fontWeight: "600",
//                 textAlign: "center",
//                 marginBottom: 20,
//               }}
//             >
//               Please wait while we fetch your location...
//             </Text>

//             <View
//               style={{
//                 width: 220,
//                 height: 6,
//                 backgroundColor: "#E5E7EB",
//                 overflow: "hidden",
//                 borderRadius: 4,
//               }}
//             >
//               <Animated.View
//                 style={{
//                   width: 80,
//                   height: 6,
//                   backgroundColor: "#007BFF",
//                   transform: [
//                     {
//                       translateX: progressAnim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [-80, 220],
//                       }),
//                     },
//                   ],
//                 }}
//               />
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </GestureHandlerRootView>
//   );
// }

// function ThemedAppContent({ linking, navigationRef, initialRoute }: any) {
//   const { theme, isDark } = useTheme();

//   const navTheme = {
//     ...(isDark ? DarkTheme : DefaultTheme),
//     colors: {
//       ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
//       background: theme.background,
//       card: theme.background,
//       text: theme.text,
//       border: theme.border,
//       notification: theme.primary,
//     },
//   };

//   return (
//     <>
//       <StatusBar
//         barStyle={isDark ? "light-content" : "dark-content"}
//         backgroundColor={theme.background}
//       />
//       <NavigationContainer
//         linking={linking}
//         ref={navigationRef}
//         theme={navTheme}
//       >
//         <AppNavigator initialRouteName={initialRoute} />
//       </NavigationContainer>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import * as Linking from "expo-linking";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as Notifications from "expo-notifications";

import { BookingCartProvider } from "./src/context/BookingCartContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

import { supabase } from "./src/lib/supabase";
import AppNavigator from "./src/navigation/AppNavigator";

import {
  registerForPushNotificationsAsync,
  savePushTokenToSupabase,
} from "./src/utils/pushNotifications";

import { GestureHandlerRootView } from "react-native-gesture-handler";

// ------------------------------------------------------------
// CUSTOMER APP UPDATE MANAGEMENT - FASTAPI
// ------------------------------------------------------------

import AppUpdateModal from "./src/components/AppUpdateModal";

import {
  checkCustomerAppVersion,
  type AppVersionCheckResult,
} from "./src/services/appVersionService";

// ------------------------------------------------------------
// MAIN APPLICATION
// ------------------------------------------------------------

export default function App() {
  const [initialRoute, setInitialRoute] = useState<
    "LocationAccess" | "Login" | "HomeDrawer" | "CompleteProfile"
  >("Login");

  const [loading, setLoading] = useState(true);

  const [showGoogleLoadingPopup, setShowGoogleLoadingPopup] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const navigationRef = React.useRef<any>(null);

  const skipAuthRedirect = React.useRef(false);

  const googleAuthInProgress = React.useRef(false);

  // ============================================================
  // CUSTOMER APP VERSION UPDATE MANAGEMENT
  // ============================================================

  // Stores update details returned by the FastAPI backend.
  const [appUpdateInfo, setAppUpdateInfo] =
    useState<AppVersionCheckResult | null>(null);

  // Remember which optional update was dismissed.
  const dismissedUpdateCode = useRef<number | null>(null);

  // Prevent duplicate version-check requests.
  const updateCheckInProgress = useRef(false);

  // Allow another check after an existing check finishes.
  const updateCheckRequestedAgain = useRef(false);

  // Check only when HomeDrawer is active.
  const isHomeDrawerActive = useRef(false);

  // Prevent setting state after component unmount.
  const updateCheckMounted = useRef(true);

  // ------------------------------------------------------------
  // CHECK CUSTOMER APPLICATION UPDATE THROUGH FASTAPI
  // ------------------------------------------------------------

  const checkForAppUpdate = useCallback(async () => {
    if (!isHomeDrawerActive.current) {
      return;
    }

    // If an update request is already running,
    // request another check after it finishes.
    if (updateCheckInProgress.current) {
      updateCheckRequestedAgain.current = true;
      return;
    }

    updateCheckInProgress.current = true;

    try {
      do {
        updateCheckRequestedAgain.current = false;

        console.log(
          "[AppUpdate] Checking Customer App version through FastAPI...",
        );

        // Calls the updated appVersionService.ts.
        // This communicates with FastAPI, not directly with Supabase.
        const result = await checkCustomerAppVersion();

        if (!updateCheckMounted.current) {
          return;
        }

        // Do not display the update popup outside HomeDrawer.
        if (!isHomeDrawerActive.current) {
          setAppUpdateInfo(null);
          return;
        }

        // No new update or update checking disabled.
        if (!result.updateAvailable) {
          console.log("[AppUpdate] No application update required.");

          setAppUpdateInfo(null);
          continue;
        }

        // Do not show the same optional update again
        // after the customer selects Maybe Later.
        if (
          !result.mandatory &&
          dismissedUpdateCode.current === result.latestVersionCode
        ) {
          console.log("[AppUpdate] Optional update already dismissed.");

          setAppUpdateInfo(null);
          continue;
        }

        console.log("[AppUpdate] Update available:", {
          installedVersion: result.installedVersion,
          installedVersionCode: result.installedVersionCode,
          latestVersion: result.latestVersion,
          latestVersionCode: result.latestVersionCode,
          mandatory: result.mandatory,
        });

        // Display the AppUpdateModal.
        setAppUpdateInfo(result);
      } while (updateCheckRequestedAgain.current);
    } catch (error) {
      console.error("[AppUpdate] Application version check failed:", error);
    } finally {
      updateCheckInProgress.current = false;
    }
  }, []);

  // ------------------------------------------------------------
  // CHECK WHEN CUSTOMER ENTERS HOME DRAWER
  // ------------------------------------------------------------

  const handleNavigationChange = useCallback(() => {
    const navigation = navigationRef.current;

    if (!navigation?.isReady?.()) {
      return;
    }

    const rootState = navigation.getRootState();

    const activeRootRoute = rootState?.routes?.[rootState.index ?? 0];

    const onHomeDrawer = activeRootRoute?.name === "HomeDrawer";

    const wasOnHomeDrawer = isHomeDrawerActive.current;

    isHomeDrawerActive.current = onHomeDrawer;

    // Hide the update popup outside the HomeDrawer route.
    if (!onHomeDrawer) {
      setAppUpdateInfo(null);
      return;
    }

    // Check for updates when entering HomeDrawer.
    if (!wasOnHomeDrawer) {
      console.log("[AppUpdate] HomeDrawer opened. Checking app version.");

      void checkForAppUpdate();
    }
  }, [checkForAppUpdate]);

  // ------------------------------------------------------------
  // HANDLE OPTIONAL UPDATE DISMISSAL
  // ------------------------------------------------------------

  const handleUpdateLater = useCallback(() => {
    // Mandatory updates must not be dismissed.
    if (appUpdateInfo?.mandatory) {
      return;
    }

    // Remember the optional update version code.
    dismissedUpdateCode.current = appUpdateInfo?.latestVersionCode ?? null;

    console.log("[AppUpdate] Customer selected Maybe Later.");

    setAppUpdateInfo(null);
  }, [appUpdateInfo]);

  // ------------------------------------------------------------
  // RECHECK WHEN APPLICATION RETURNS TO FOREGROUND
  // ------------------------------------------------------------

  useEffect(() => {
    updateCheckMounted.current = true;

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && isHomeDrawerActive.current) {
        console.log("[AppUpdate] Application returned to foreground.");

        void checkForAppUpdate();
      }
    });

    return () => {
      updateCheckMounted.current = false;
      subscription.remove();
    };
  }, [checkForAppUpdate]);

  // ============================================================
  // PUSH TOKEN
  // ============================================================

  const handlePushToken = async (userId: string) => {
    try {
      const token = await registerForPushNotificationsAsync();

      if (token) {
        await savePushTokenToSupabase(userId, token);
      }
    } catch (err) {
      console.error("Push token registration failed:", err);
    }
  };

  // ============================================================
  // AUTH / APP INITIALIZATION
  // ============================================================

  useEffect(() => {
    if (showGoogleLoadingPopup) {
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [showGoogleLoadingPopup]);

  useEffect(() => {
    let hasCheckedOnce = false;

    // ----------------------------------------------------------
    // TIMEOUT HELPER
    // ----------------------------------------------------------

    const withTimeout = <T,>(
      promise: PromiseLike<T>,
      ms: number,
      label: string,
    ): Promise<T> => {
      return Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) =>
          setTimeout(
            () =>
              reject(new Error(`Timeout: ${label} took longer than ${ms}ms`)),
            ms,
          ),
        ),
      ]);
    };

    // ----------------------------------------------------------
    // CHECK PROFILE COMPLETENESS
    // ----------------------------------------------------------

    const checkCompleteness = async (
      userId: string,
      useNav = true,
    ): Promise<boolean> => {
      console.log("[AUTH DEBUG] checkCompleteness START for user:", userId);

      if (!userId) {
        console.log("[AUTH DEBUG] No userId, returning true");
        return true;
      }

      try {
        console.log("[AUTH DEBUG] supabase.auth.getUser() START");

        const {
          data: { user },
          error: userError,
        } = await withTimeout<any>(
          supabase.auth.getUser(),
          8000,
          "supabase.auth.getUser",
        );

        if (userError || !user) {
          if (
            userError?.message?.includes("Refresh Token") ||
            userError?.status === 401
          ) {
            await supabase.auth.signOut();
          }

          return true;
        }

        console.log("[AUTH DEBUG] profile query START");

        const { data: profile } = await withTimeout<any>(
          supabase
            .from("profile")
            .select("full_name, phone")
            .eq("id", userId)
            .maybeSingle(),
          8000,
          "profile query",
        );

        if (
          profile &&
          profile.full_name &&
          profile.full_name.trim().length > 0
        ) {
          console.log("[AUTH DEBUG] Profile complete, returning true");

          return true;
        }

        if (useNav) {
          const rawPhone =
            profile?.phone ||
            user.phone ||
            user.user_metadata?.phone_number ||
            "";

          const digits = rawPhone.replace(/\D/g, "").slice(-10);

          // Preserve existing phone formatting.
          const finalFormattedPhone = digits ? `+91${digits}` : "";

          console.log(
            "[AUTH DEBUG] Incomplete profile detected! Navigating to CompleteProfile screen...",
          );

          navigationRef.current?.reset({
            index: 0,
            routes: [
              {
                name: "CompleteProfile",
                params: {
                  initialData: {
                    phone: finalFormattedPhone,
                  },
                },
              },
            ],
          });
        }

        return false;
      } catch (err) {
        console.error("[AUTH DEBUG] checkCompleteness catch error:", err);

        return true;
      }
    };

    // ----------------------------------------------------------
    // INITIAL APP LAUNCH
    // ----------------------------------------------------------

    const initApp = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (
            sessionError.message?.includes("Refresh Token") ||
            sessionError.status === 400
          ) {
            await supabase.auth.signOut();

            setInitialRoute("Login");
            setLoading(false);

            return;
          }

          throw sessionError;
        }

        if (session?.user) {
          handlePushToken(session.user.id);

          hasCheckedOnce = true;

          setInitialRoute("LocationAccess");
        } else {
          setInitialRoute("Login");
        }
      } catch (err) {
        console.error("App init failed:", err);

        setInitialRoute("Login");
      } finally {
        setLoading(false);
      }
    };

    initApp();

    // ----------------------------------------------------------
    // AUTH STATE LISTENER
    // ----------------------------------------------------------

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "🌐 [App Debug] onAuthStateChange event:",
          event,
          "session user:",
          session?.user?.id,
        );

        if (event === "SIGNED_OUT") {
          skipAuthRedirect.current = false;

          hasCheckedOnce = false;

          googleAuthInProgress.current = false;

          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });

          return;
        }

        if (skipAuthRedirect.current && event === "SIGNED_IN") {
          return;
        }

        if (event === "SIGNED_IN" && session?.user && !hasCheckedOnce) {
          hasCheckedOnce = true;

          const userId = session.user.id;

          handlePushToken(userId);

          if (googleAuthInProgress.current) {
            console.log("[AUTH] Google SIGNED_IN detected");

            return;
          }

          // Existing login navigation remains unchanged.
          console.log(
            "🌐 [App Debug] Standard login detected. Navigation is handled natively by LoginScreen.",
          );
        }
      },
    );

    // ----------------------------------------------------------
    // DEEP LINK HANDLER
    // ----------------------------------------------------------

    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!url) {
        return;
      }

      if (url.includes("google-auth")) {
        const fragment = url.split("#")[1];

        if (!fragment) {
          return;
        }

        const params = new URLSearchParams(fragment);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken || !refreshToken) {
          return;
        }

        googleAuthInProgress.current = true;

        hasCheckedOnce = false;

        setShowGoogleLoadingPopup(true);

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            googleAuthInProgress.current = false;
            return;
          }

          if (data?.session?.user) {
            const user = data.session.user;

            const fullName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "Customer";

            await supabase.from("profile").upsert({
              id: user.id,
              email: user.email,
              full_name: fullName,
              phone: null,
              address: null,
              pincode: null,
            });

            setShowGoogleLoadingPopup(false);

            const isComplete = await checkCompleteness(user.id, true);

            if (isComplete) {
              navigationRef.current?.reset({
                index: 0,
                routes: [
                  {
                    name: "LocationAccess",
                  },
                ],
              });
            }

            googleAuthInProgress.current = false;
          } else {
            googleAuthInProgress.current = false;

            setShowGoogleLoadingPopup(false);
          }
        } catch (err) {
          googleAuthInProgress.current = false;

          setShowGoogleLoadingPopup(false);
        }

        return;
      }

      if (url.includes("reset-password") || url.includes("type=recovery")) {
        skipAuthRedirect.current = true;

        const searchPart = url.includes("#")
          ? url.split("#")[1]
          : url.split("?")[1];

        if (searchPart) {
          const params = new URLSearchParams(searchPart);

          const accessToken = params.get("access_token");

          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            setTimeout(() => {
              navigationRef.current?.reset({
                index: 0,
                routes: [
                  {
                    name: "ResetPassword",
                    params: {
                      access_token: accessToken,
                      refresh_token: refreshToken,
                    },
                  },
                ],
              });
            }, 800);
          }
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener("url", handleDeepLink);

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data?.screen === "bookings") {
          navigationRef.current?.navigate("HomeDrawer", {
            screen: "AuthenticatedScreens",
            params: {
              screen: "MainTabs",
              params: {
                screen: "MyBookingsTab",
              },
            },
          });
        }
      });

    return () => {
      listener.subscription.unsubscribe();

      subscription.remove();

      notificationResponseSubscription.remove();
    };
  }, []);

  // ============================================================
  // DEEP LINK CONFIGURATION
  // ============================================================

  const linking: any = {
    prefixes: [
      Linking.createURL("/"),
      "neatifynation://",
      "theneatifyteam://",
      "https://www.theneatifyteam.in",
      "https://theneatifyteam.in",
    ],
    config: {
      screens: {
        HomeDrawer: {
          screens: {
            AuthenticatedScreens: {
              screens: {
                MainTabs: {
                  screens: {
                    HomeTab: {
                      screens: {
                        ServiceDetail: "service/:serviceId",
                        HomeMain: "*",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    async getInitialURL() {
      const url = await Linking.getInitialURL();
      return url;
    },

    subscribe(listener: (url: string) => void) {
      const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
        listener(url);
      });

      return () => {
        linkingSubscription.remove();
      };
    },
  };

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (loading) {
    return null;
  }

  // ============================================================
  // APPLICATION UI
  // ============================================================

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <BookingCartProvider>
                <ThemedAppContent
                  linking={linking}
                  navigationRef={navigationRef}
                  initialRoute={initialRoute}
                  onNavigationChange={handleNavigationChange}
                />
              </BookingCartProvider>
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>

      {/* ========================================================
          GOOGLE AUTHENTICATION LOADING POPUP
          ======================================================== */}

      <Modal visible={showGoogleLoadingPopup} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 320,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Please wait while we fetch your location...
            </Text>

            <View
              style={{
                width: 220,
                height: 6,
                backgroundColor: "#E5E7EB",
                overflow: "hidden",
                borderRadius: 4,
              }}
            >
              <Animated.View
                style={{
                  width: 80,
                  height: 6,
                  backgroundColor: "#007BFF",
                  transform: [
                    {
                      translateX: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-80, 220],
                      }),
                    },
                  ],
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          CUSTOMER APP UPDATE POPUP
          ======================================================== */}

      <AppUpdateModal
        visible={Boolean(
          isHomeDrawerActive.current && appUpdateInfo?.updateAvailable,
        )}
        updateInfo={appUpdateInfo}
        onLater={handleUpdateLater}
      />
    </GestureHandlerRootView>
  );
}

// ============================================================
// THEMED APPLICATION CONTENT
// ============================================================

function ThemedAppContent({
  linking,
  navigationRef,
  initialRoute,
  onNavigationChange,
}: any) {
  const { theme, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),

      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <NavigationContainer
        linking={linking}
        ref={navigationRef}
        theme={navTheme}
        onReady={onNavigationChange}
        onStateChange={onNavigationChange}
      >
        <AppNavigator initialRouteName={initialRoute} />
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
