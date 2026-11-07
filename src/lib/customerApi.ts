import type { MainCategory, Service } from "../types/service";
import { supabase } from "./supabase";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  ""
)
  .trim()
  .replace(/\/+$/, "");

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  [key: string]: any;
}

async function getAuthHeaders(required = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      if (required) throw new Error("Customer is not authenticated");
    } else {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    if (required) throw err;
  }
  return headers;
}

export async function getCustomerServices(
  filters: {
    service_type?: string;
    main_category_id?: string;
  } = {}
): Promise<Service[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const params: string[] = [];

  if (filters.service_type) {
    params.push(
      `service_type=${encodeURIComponent(filters.service_type)}`
    );
  }

  if (filters.main_category_id) {
    params.push(
      `main_category_id=${encodeURIComponent(filters.main_category_id)}`
    );
  }

  const queryString = params.length
    ? `?${params.join("&")}`
    : "";

  const url = `${API_BASE_URL}/api/v1/customer/services${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Customer API request failed: HTTP ${response.status}`
    );
  }

  const result: ApiResponse<Service[]> = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid Customer API response");
  }

  return result.data;
}

export async function getCustomerServiceDetails(
  serviceIdentifier: string
): Promise<Service> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const url = `${API_BASE_URL}/api/v1/customer/services/${encodeURIComponent(
    serviceIdentifier
  )}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Unable to fetch service details. HTTP ${response.status}`
    );
  }

  const result: {
    success: boolean;
    data: Service;
  } = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Invalid service details response");
  }

  return result.data;
}

export async function getCustomerMainCategories(): Promise<MainCategory[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const url = `${API_BASE_URL}/api/v1/customer/main-categories`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Unable to fetch main categories. HTTP ${response.status}`
    );
  }

  const result: {
    success: boolean;
    data: MainCategory[];
  } = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid main categories API response");
  }

  return result.data;
}

export interface CustomerAddOn {
  id: string;
  title: string;
  duration: string;
  price: string;
  image: string | null;
  service_type: string;
  description: string | null;
  sort_order: number;
  original_price: string | null;
  discount_percent: number | null;
  discount_label: string | null;
  tax_percent: string | null;
  work_includes: string | null;
  work_not_included: string | null;
  max_quantity: number | null;
  is_active: boolean;
}

export async function getCustomerAddons(): Promise<CustomerAddOn[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/addons`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch add-ons. HTTP ${response.status}`
    );
  }

  const result: ApiResponse<CustomerAddOn[]> = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid add-ons API response");
  }

  return result.data;
}

export interface CustomerOffer {
  title: string;
  service_type: string;
  offer_percentage: number;
  description: string | null;
}

export async function getCustomerOffers(): Promise<CustomerOffer[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/offers`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch customer offers. HTTP ${response.status}`
    );
  }

  const result: ApiResponse<CustomerOffer[]> = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid customer offers API response");
  }

  return result.data;
}

export interface CustomerHeroBanner {
  image_path: string;
}

export async function getCustomerHeroBanners(): Promise<CustomerHeroBanner[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/hero-banners`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch customer hero banners. HTTP ${response.status}`
    );
  }

  const result: ApiResponse<CustomerHeroBanner[]> = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid customer hero banners API response");
  }

  return result.data;
}

export interface CustomerAppPopup {
  title: string;
  description: string | null;
  image_url: string | null;
}

export async function getCustomerAppPopups(): Promise<CustomerAppPopup[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/app-popups`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch customer app popups. HTTP ${response.status}`
    );
  }

  const result: ApiResponse<CustomerAppPopup[]> = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid customer app popups API response");
  }

  return result.data;
}

export interface CustomerPromotionalBanner {
  id: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
  storage_path: string | null;
  customer_type: string | null;
  booking_condition: string | null;
  location_scope: string | null;
  service_scope: string | null;
  pincode_scope: string | null;
  offer_percentage: number | null;
  banner_type: string;
}

export async function getCustomerPromotionalBanners(): Promise<
  CustomerPromotionalBanner[]
> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/promotional-banners`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch customer promotional banners. HTTP ${response.status}`
    );
  }

  const result: ApiResponse<CustomerPromotionalBanner[]> = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(
      "Invalid customer promotional banners API response"
    );
  }

  return result.data;
}

export async function getAuthenticatedCustomer(): Promise<{
  user_id: string;
}> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/auth/me`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Customer authentication failed: HTTP ${response.status}`
    );
  }

  const result: ApiResponse<{ user_id: string }> = await response.json();

  if (
    !result.success ||
    !result.data ||
    typeof result.data.user_id !== "string"
  ) {
    throw new Error("Invalid customer authentication response");
  }

  return result.data;
}

/* ================= MY BOOKINGS ================= */

export async function getCustomerMyBookings(): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/my-bookings`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch bookings: HTTP ${response.status}`
    );
  }

  const result: ApiResponse<any[]> = await response.json();
  return result.data || [];
}

/* ================= PROFILE & WALLET ================= */

export async function getCustomerProfile(): Promise<{
  profile: any;
  data: any;
  resolved_user_id: string;
  wallet_balance: number;
}> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/profile`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch customer profile: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return {
    profile: result.data,
    data: result.data,
    resolved_user_id: result.resolved_user_id,
    wallet_balance: result.wallet_balance || 0,
  };
}

export async function updateCustomerProfile(data: {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  pincode?: string | null;
  service_selected?: string | null;
  promotional_banner_selected?: string | null;
  referral_code?: string | null;
}): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/profile`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to update customer profile: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data;
}

/* ================= ADDRESSES ================= */

export async function getCustomerAddresses(): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/addresses`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch addresses: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || [];
}

export async function saveCustomerAddress(data: {
  tag?: string;
  house_no?: string;
  landmark?: string;
  full_address: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/addresses`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let message = `Unable to save address: HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail) message = errJson.detail;
      else if (errJson?.message) message = errJson.message;
    } catch (_) {}
    throw new Error(message);
  }

  const result = await response.json();
  return result.data;
}

export async function deleteCustomerAddress(addressId: string): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/addresses/${encodeURIComponent(addressId)}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to delete address: HTTP ${response.status}`
    );
  }

  return response.json();
}

/* ================= POLICIES ================= */

export async function getCustomerPolicies(): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/policies`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch policies: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data;
}

/* ================= HUBS & PINCODE ================= */

export async function checkPincodeServiceable(
  pincode: string,
  address?: string
): Promise<{ serviceable: boolean; hub: any; locations?: any[] }> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  let url = `${API_BASE_URL}/api/v1/customer/hubs/check-pincode?pincode=${encodeURIComponent(pincode)}`;
  if (address) {
    url += `&address=${encodeURIComponent(address)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Unable to check pincode: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return {
    serviceable: Boolean(result.serviceable),
    hub: result.hub || null,
    locations: result.locations || [],
  };
}

/* ================= SCHEDULE ================= */

export async function getCustomerScheduleConfig(): Promise<{
  config: Record<string, any>;
  raw: any[];
}> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/schedule/config`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch schedule configuration: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return {
    config: result.data || {},
    raw: result.raw || [],
  };
}

export async function checkScheduleCapacity(
  bookingDate: string,
  hubName: string,
  category?: string
): Promise<{ staff_count: number; booked_slots: Record<string, number> }> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  let url = `${API_BASE_URL}/api/v1/customer/schedule/capacity-check?booking_date=${encodeURIComponent(
    bookingDate
  )}&hub_name=${encodeURIComponent(hubName)}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Unable to check schedule capacity: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || { staff_count: 1, booked_slots: {} };
}

/* ================= CART ================= */

export async function getCustomerCart(): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/cart`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch cart: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || [];
}

export async function addCustomerCartItem(item: {
  service_id: string;
  title: string;
  duration?: string;
  price?: string;
  image?: string;
}): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/cart/items`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(item),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to add cart item: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data;
}

export async function removeCustomerCartItem(serviceId: string): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/cart/items/${encodeURIComponent(serviceId)}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to remove cart item: HTTP ${response.status}`
    );
  }

  return response.json();
}

export async function clearCustomerCart(): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/cart`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to clear cart: HTTP ${response.status}`
    );
  }

  return response.json();
}

/* ================= COUPONS ================= */

export async function validateCustomerCoupon(
  code: string,
  phone?: string,
  bannerId?: string
): Promise<{
  valid: boolean;
  message: string;
  coupon?: any;
  discount_percentage?: number;
  discount_amount?: number;
}> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/coupons/validate`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        phone,
        banner_id: bannerId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to validate coupon: HTTP ${response.status}`
    );
  }

  return response.json();
}

export async function getMyCoupons(): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/coupons/my-coupons`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch coupons: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || [];
}

/* ================= BOOKINGS ================= */

export async function createCustomerBooking(data: any): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/create`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Unable to create booking: HTTP ${response.status} - ${errorText}`
    );
  }

  const result = await response.json();
  return result.data;
}

export async function getCustomerBookingDetails(
  bookingId: string
): Promise<{ booking: any; staff?: any }> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch booking details: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return {
    booking: result.data,
    staff: result.staff,
  };
}

export async function cancelCustomerBooking(
  bookingId: string,
  cancelReason?: string
): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        cancel_reason: cancelReason || "Customer requested cancellation",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to cancel booking: HTTP ${response.status}`
    );
  }

  return response.json();
}

export async function getCustomerBookingChecklist(
  bookingId: string
): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/${encodeURIComponent(bookingId)}/checklist`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch checklist: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || [];
}

export async function submitCustomerBookingChecklist(
  bookingId: string,
  items: Array<{
    task_index: number;
    task_title: string;
    customer_completed: boolean;
    partner_verified?: boolean;
  }>
): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/${encodeURIComponent(bookingId)}/checklist`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ items }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to submit checklist: HTTP ${response.status}`
    );
  }

  return response.json();
}

export async function getCustomerBookingReview(
  bookingId: string
): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/${encodeURIComponent(bookingId)}/reviews`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch review: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data;
}

export async function submitCustomerBookingReview(
  bookingId: string,
  rating: number,
  comment?: string
): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);
  const cleanRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/${encodeURIComponent(bookingId)}/reviews`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        rating: cleanRating,
        comment: (comment || "").trim(),
      }),
    }
  );

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail) {
        errorDetail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch (_) {
      try {
        const errText = await response.text();
        if (errText) errorDetail = errText.slice(0, 100);
      } catch (_) {}
    }
    throw new Error(errorDetail);
  }

  return response.json();
}


export async function updateCustomerBookingPayment(
  bookingId: string,
  payload: {
    payment_status?: string;
    work_status?: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    payment_verified?: boolean;
    paid_amount?: number;
    remaining_amount?: number;
    payment_plan?: string;
    payment_type?: string;
  }
): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/bookings/${encodeURIComponent(bookingId)}/payment-status`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to update booking payment: HTTP ${response.status}`
    );
  }

  return response.json();
}

export async function getCustomerScheduleDateBookings(
  bookingDate: string
): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/schedule/date-bookings?booking_date=${encodeURIComponent(bookingDate)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch date bookings: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || [];
}

export async function getCustomerHubCategoryCounts(
  hub: string
): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/schedule/hub-category-counts?hub=${encodeURIComponent(hub)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch hub category counts: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || [];
}

export async function getCustomerPromotionalBannerRelations(): Promise<{
  locations: Array<{ banner_id: string; location_id: string }>;
  services: Array<{ banner_id: string; service_id: string }>;
}> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/promotional-banners/relations`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch promotional banner relations: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || { locations: [], services: [] };
}

export async function getCustomerConsumedPromotionalBanners(): Promise<string[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/promotional-banners/consumed`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch consumed promotional banners: HTTP ${response.status}`
    );
  }

  const result = await response.json();
  return result.data || [];
}


export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  referrer_id?: string;
}> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/profile/validate-referral?code=${encodeURIComponent(code)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to validate referral: HTTP ${response.status}`);
  }

  const result = await response.json();
  return {
    valid: !!result.valid,
    referrer_id: result.referrer_id,
  };
}

export async function saveCustomerPushToken(token: string, platform: string = "android"): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/profile/push-token`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ token, platform }),
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to save push token: HTTP ${response.status}`);
  }

  return response.json();
}

export async function removeCustomerPushToken(token: string): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/profile/push-token?token=${encodeURIComponent(token)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to remove push token: HTTP ${response.status}`);
  }

  return response.json();
}

export async function getServiceHowItWorksVideos(serviceId: string): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/customer/services/${encodeURIComponent(serviceId)}/videos`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to fetch service videos: HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data || [];
}

export async function getCustomerHubLocations(): Promise<any[]> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/customer/hubs/locations`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch hub locations: HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data || [];
}


/* ================= PAYMENTS (Replaces create-razorpay-order & verify-payment edge functions) ================= */

export async function createCustomerRazorpayOrder(
  amount: number,
  bookingId?: string,
  paymentType: string = "FULL"
): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);
  const response = await fetch(`${API_BASE_URL}/api/v1/customer/payments/create-order`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount,
      booking_id: bookingId,
      payment_type: paymentType,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.detail || result.error || "Failed to create Razorpay order");
  }

  return result.data;
}

export async function verifyCustomerRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
  payment_type?: string;
  paid_amount?: number;
  remaining_amount?: number;
}): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const headers = await getAuthHeaders(true);
  const response = await fetch(`${API_BASE_URL}/api/v1/customer/payments/verify`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.detail || result.error || "Payment verification failed");
  }

  return result;
}

/* ================= AUTHENTICATION (Replaces msg91-hook & verify-otp edge functions) ================= */

export async function sendCustomerAuthOtp(phone: string): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/customer/auth/send-otp`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone }),
  });

  const rawText = await response.text();
  let result: any;
  try {
    result = JSON.parse(rawText);
  } catch {
    throw new Error(`Server returned HTTP ${response.status}. Please check backend server status.`);
  }

  if (!response.ok || !result.success) {
    throw new Error(result.detail || "Unable to send OTP. Please try again.");
  }

  return result;
}

export async function verifyCustomerAuthOtp(phone: string, otp: string): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/customer/auth/verify-otp`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, otp }),
  });

  const rawText = await response.text();
  let result: any;
  try {
    result = JSON.parse(rawText);
  } catch {
    throw new Error(`Server returned HTTP ${response.status}. Please check backend server status.`);
  }

  if (!response.ok || !result.success) {
    throw new Error(result.detail || "Invalid or expired OTP.");
  }

  return result;
}
