import { validateReferralCode as apiValidateReferralCode } from "../lib/customerApi";

/**
 * Generates a random referral code
 * Format: NEAT-XXXX (where X is uppercase alphanumeric)
 */
export const generateReferralCode = (name: string): string => {
  const prefix = "NEAT";
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const namePart = name ? name.split(' ')[0].substring(0, 3).toUpperCase() : "";
  return `${prefix}-${namePart}${randomStr}`;
};

/**
 * Checks if a referral code exists and returns the referrer's profile ID
 */
export const validateReferralCode = async (code: string): Promise<string | null> => {
  if (!code) return null;

  try {
    const res = await apiValidateReferralCode(code.trim().toUpperCase());
    return res.valid && res.referrer_id ? res.referrer_id : null;
  } catch (error) {
    console.error("Error validating referral code:", error);
    return null;
  }
};
