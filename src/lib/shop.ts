export const SHOP_NAME = "OMR'S GREAT SERVICE POINT";
export const SHOP_TAGLINE = "Bike Service & Repair";
export const SHOP_ADDRESS =
  "OMR, Padur Roundana, Chengalpet District – 603103, (Opp-to Godrej Azure Apartment)";
export const SHOP_EMAIL = "thegreatservicepoint@gmail.com";
export const SHOP_PHONE = "+91 8610753386";
export const SHOP_WHATSAPP = "+91 9080160454";
export const SHOP_THANK_YOU = `Thank you for choosing ${SHOP_NAME}.`;

/** Sign-in ID shown on the login screen. */
export const LOGIN_ID = "Admin";

/** Supabase Auth stores an email. The Admin ID maps to this address. */
export const LOGIN_EMAIL = SHOP_EMAIL;

export function resolveLoginEmail(identifier: string): string {
  const id = identifier.trim();
  if (id.toLowerCase() === LOGIN_ID.toLowerCase()) return LOGIN_EMAIL;
  if (id.includes("@")) return id;
  const digits = id.replace(/\D/g, "");
  return `${digits}@thegreatservicepoint.local`;
}
