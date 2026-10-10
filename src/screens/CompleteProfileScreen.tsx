// import { useNavigation, useRoute } from "@react-navigation/native";
// import React, { useEffect, useState } from "react";
// import {
//     ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
//     StyleSheet,
//     Text, TextInput, TouchableOpacity,
//     View
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
// import { COLORS } from "../theme/colors";

// export default function CompleteProfileScreen() {
//     const navigation = useNavigation<any>();
//     const route = useRoute<any>();

//     const [userId, setUserId] = useState<string | null>(null);
//     const [userPhone, setUserPhone] = useState<string>("");
//     const [fullName, setFullName] = useState("");
//     const [email, setEmail] = useState("");
//     const [address, setAddress] = useState("");
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         // Safely get the user ID directly from the active Supabase session
//         const fetchAuthData = async () => {
//             const { data: { user }, error } = await supabase.auth.getUser();

//             if (user) {
//                 setUserId(user.id);

//                 // Format the phone number to exactly 10 digits
//                 const rawPhone = user.phone || route.params?.userPhone || route.params?.initialData?.phone || "";
//                 const digits = rawPhone.replace(/\D/g, "").slice(-10);
//                 setUserPhone(digits);
//             } else {
//                 console.error("No active user session found:", error);
//             }
//         };

//         fetchAuthData();
//     }, []);

//     const handleSaveProfile = async () => {
//         if (!fullName.trim() || !email.trim()) {
//             Alert.alert("Required Fields", "Please enter your full name and email.");
//             return;
//         }

//         if (!userId) {
//             Alert.alert("Authentication Error", "Could not verify your user ID. Please log in again.");
//             return;
//         }

//         setLoading(true);
//         try {
//             // Now 'userId' is guaranteed to be the valid Supabase UUID
//             const { error: profileError } = await supabase
//                 .from("profile")
//                 .insert({
//                     id: userId,
//                     full_name: fullName,
//                     email: email,
//                     phone: userPhone,
//                     address: address,
//                 });

//             if (profileError) throw profileError;

//             // Create an empty wallet for the new user
//             const { error: walletError } = await supabase
//                 .from("wallet")
//                 .insert({ user_id: userId, balance: 0 });

//             if (walletError) console.error("Wallet creation failed:", walletError);

//             // Successfully saved! Send them to the Home screen
//             navigation.reset({ index: 0, routes: [{ name: "HomeDrawer" }] });

//         } catch (error: any) {
//             console.error("Save Profile Error:", error);
//             Alert.alert("Database Error", error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
//                 <View style={styles.content}>
//                     <Text style={styles.title}>Complete Your Profile</Text>
//                     <Text style={styles.subtitle}>Just a few more details to get you started.</Text>

//                     <View style={styles.form}>
//                         <Text style={styles.label}>Phone Number</Text>
//                         <TextInput
//                             style={[styles.input, styles.disabledInput]}
//                             value={userPhone}
//                             editable={false}
//                         />

//                         <Text style={styles.label}>Full Name *</Text>
//                         <TextInput
//                             style={styles.input}
//                             placeholder="e.g. John Doe"
//                             value={fullName}
//                             onChangeText={setFullName}
//                             autoCapitalize="words"
//                         />

//                         <Text style={styles.label}>Email Address *</Text>
//                         <TextInput
//                             style={styles.input}
//                             placeholder="e.g. john@example.com"
//                             value={email}
//                             onChangeText={setEmail}
//                             keyboardType="email-address"
//                             autoCapitalize="none"
//                         />

//                         <Text style={styles.label}>Current Address</Text>
//                         <TextInput
//                             style={[styles.input, styles.textArea]}
//                             placeholder="Enter your address..."
//                             value={address}
//                             onChangeText={setAddress}
//                             multiline
//                         />

//                         <TouchableOpacity
//                             style={styles.primaryBtn}
//                             onPress={handleSaveProfile}
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <ActivityIndicator color="#111" />
//                             ) : (
//                                 <Text style={styles.primaryText}>Save & Continue</Text>
//                             )}
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#FDFDFD" },
//     content: { padding: 24, flex: 1, justifyContent: "center" },
//     title: { fontSize: 28, fontWeight: "800", color: "#111", marginBottom: 8 },
//     subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
//     form: { gap: 16 },
//     label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: -8, marginLeft: 4 },
//     input: { borderWidth: 1.5, borderColor: "#E5E5E5", borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: "#FFF", color: "#111" },
//     disabledInput: { backgroundColor: "#F5F5F5", color: "#888" },
//     textArea: { height: 80, textAlignVertical: "top" },
//     primaryBtn: { backgroundColor: COLORS.saffron, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 12 },
//     primaryText: { color: "#111", fontWeight: "800", fontSize: 16 },
// });


import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import LocationService from "../services/LocationService";
import { COLORS } from "../theme/colors";

export default function CompleteProfileScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const [userId, setUserId] = useState<string | null>(null);
    const [userPhone, setUserPhone] = useState<string>("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    // Address & Location States
    const [address, setAddress] = useState("");
    const [pincode, setPincode] = useState(""); // Kept in background for Database
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [rawAddress, setRawAddress] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    useEffect(() => {
        const fetchAuthData = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const rawPhone = user.phone || route.params?.userPhone || route.params?.initialData?.phone || "";
                const digits = rawPhone.replace(/\D/g, "").slice(-10);
                setUserPhone(digits);
            } else {
                console.error("No active user session found:", error);
            }
        };
        fetchAuthData();

        // Fetch location on mount
        handleFetchCurrentLocation();
    }, []);

    // Listen for updates if user returns from LocationSearchScreen map
    useFocusEffect(
        useCallback(() => {
            const fetchSelectedMapLocation = async () => {
                try {
                    const loc = await LocationService.getSelectedLocation();
                    if (loc && loc.fullAddress) {
                        setAddress(loc.fullAddress);
                        setLatitude(loc.latitude);
                        setLongitude(loc.longitude);
                        setPincode(loc.postalCode || "");
                        setRawAddress(loc.rawAddress || null);
                    }
                } catch (e) {
                    console.log("No stored location found yet");
                }
            };
            fetchSelectedMapLocation();
        }, [])
    );

    const handleFetchCurrentLocation = async () => {
        setIsFetchingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Please allow location access to fetch your current address automatically.");
                setIsFetchingLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);

            const addressArray = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (addressArray.length > 0) {
                const addr = addressArray[0];
                // Included postalCode directly in the single address string
                const fullAddress = [addr.name, addr.street, addr.city || addr.subregion, addr.region, addr.country, addr.postalCode]
                    .filter(Boolean)
                    .join(", ");

                setAddress(fullAddress);
                setPincode(addr.postalCode || "");
                setRawAddress(addr);
            }
        } catch (error) {
            console.warn("Error fetching location:", error);
        } finally {
            setIsFetchingLocation(false);
        }
    };

    // Auto-extract pincode if the user manually types/edits the text box
    const handleAddressChange = (text: string) => {
        setAddress(text);
        const match = text.match(/\b\d{6}\b/);
        if (match) {
            setPincode(match[0]);
        }
    };

    const handleSaveProfile = async () => {
        if (!fullName.trim() || !email.trim()) {
            Alert.alert("Required Fields", "Please enter your full name and email.");
            return;
        }

        if (!address.trim()) {
            Alert.alert("Required Field", "Please enter or fetch your current address.");
            return;
        }

        if (!pincode.trim()) {
            Alert.alert("Missing Pincode", "Please ensure your address includes a 6-digit pincode.");
            return;
        }

        if (!userId) {
            Alert.alert("Authentication Error", "Could not verify your user ID. Please log in again.");
            return;
        }

        setLoading(true);
        try {
            // 1. Save Profile (Upsert)
            const { error: profileError } = await supabase
                .from("profile")
                .upsert({
                    id: userId,
                    full_name: fullName,
                    email: email,
                    phone: userPhone,
                    address: address,
                });

            if (profileError) throw profileError;

            // 2. Clear out any existing "Home" addresses just in case
            await supabase.from("user_addresses").delete().eq("user_id", userId).eq("tag", "Home");

            // 3. Extract House No from the start of the address
            const derivedHouseNo = address.includes(",") ? address.split(",")[0].trim() : "N/A";

            // 4. Save to user_addresses
            const { error: addressError } = await supabase
                .from("user_addresses")
                .insert({
                    user_id: userId,
                    tag: "Home",
                    house_no: derivedHouseNo,
                    full_address: address,
                    latitude: latitude,
                    longitude: longitude,
                    pincode: pincode
                });

            if (addressError) console.error("Address save failed:", addressError);

            // 5. Create Wallet (ignore error if it already exists)
            await supabase.from("wallet").insert({ user_id: userId, balance: 0 });

            // 6. Update local app state
            await LocationService.setSelectedLocation({
                locality: address,
                fullAddress: address,
                latitude: latitude || 0,
                longitude: longitude || 0,
                postalCode: pincode,
                status: 'success',
                isServiceable: true,
                rawAddress: rawAddress
            });

            // 7. Reset to LocationAccess
            navigation.reset({ index: 0, routes: [{ name: "LocationAccess" }] });

        } catch (error: any) {
            console.error("Save Profile Error:", error);
            Alert.alert("Database Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={styles.title}>Complete Your Profile</Text>
                    <Text style={styles.subtitle}>Just a few more details to get you started.</Text>

                    <View style={styles.form}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={userPhone}
                            editable={false}
                        />

                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. John Doe"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Email Address *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. john@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Current Address *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="e.g. 4/B, Nallagandla, Hyderabad, India, 500046"
                            value={address}
                            onChangeText={handleAddressChange}
                            multiline
                        />

                        {/* Yellow Action Buttons */}
                        <View style={styles.addressActionRow}>
                            <TouchableOpacity
                                style={styles.yellowBtn}
                                onPress={() => navigation.navigate("LocationSearchScreen")}
                            >
                                <Ionicons name="map-outline" size={16} color="#111" />
                                <Text style={styles.yellowBtnText}>Add Address</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.yellowBtn}
                                onPress={handleFetchCurrentLocation}
                                disabled={isFetchingLocation}
                            >
                                {isFetchingLocation ? (
                                    <ActivityIndicator size="small" color="#111" />
                                ) : (
                                    <>
                                        <Ionicons name="locate-outline" size={16} color="#111" />
                                        <Text style={styles.yellowBtnText}>Fetch Current</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={handleSaveProfile}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#111" />
                            ) : (
                                <Text style={styles.primaryText}>Save & Continue</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDFDFD" },
    scrollContent: { padding: 24, flexGrow: 1, justifyContent: "center", paddingBottom: 60 },
    title: { fontSize: 28, fontWeight: "800", color: "#111", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
    form: { gap: 16 },
    label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: -8, marginLeft: 4 },
    input: { borderWidth: 1.5, borderColor: "#E5E5E5", borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: "#FFF", color: "#111" },
    disabledInput: { backgroundColor: "#F5F5F5", color: "#888" },
    textArea: { minHeight: 100, maxHeight: 150, textAlignVertical: "top", paddingTop: 16 },

    addressActionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: -4
    },
    yellowBtn: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: COLORS.saffron,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        elevation: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    },
    yellowBtnText: {
        color: "#111",
        fontWeight: "700",
        fontSize: 13,
    },

    primaryBtn: { backgroundColor: COLORS.saffron, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 24 },
    primaryText: { color: "#111", fontWeight: "800", fontSize: 16 },
});