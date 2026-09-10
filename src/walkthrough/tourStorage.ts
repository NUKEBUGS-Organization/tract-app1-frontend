export const SIGNUP_TOUR_PENDING_KEY =
  "tract:product-tour:signup-pending";

export const REGISTRATION_VERIFICATION_PENDING_KEY =
  "tract:registration-verification-pending";

const SIGNUP_TOUR_MAX_AGE_MS =
  24 * 60 * 60 * 1000;

const REGISTRATION_MAX_AGE_MS =
  2 * 60 * 60 * 1000;

export interface TourUserIdentity {
  userId?: string | null;
  email?: string | null;
}

interface PendingSignupTour {
  userId: string;
  email: string;
  createdAt: number;
}

interface PendingRegistrationVerification {
  email: string;
  createdAt: number;
}

function normalize(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   STEP 1:
   REGISTRATION HAS SUCCEEDED AND USER MUST VERIFY OTP
========================================================= */

export function markRegistrationVerificationPending(
  email: string
) {
  const normalizedEmail = normalize(email);

  if (!normalizedEmail) {
    return;
  }

  const pending: PendingRegistrationVerification = {
    email: normalizedEmail,
    createdAt: Date.now(),
  };

  sessionStorage.setItem(
    REGISTRATION_VERIFICATION_PENDING_KEY,
    JSON.stringify(pending)
  );
}

/**
 * Used by VerifyPage to make sure this OTP verification
 * really came from a successful registration.
 */
export function isRegistrationVerificationPending(
  email: string
) {
  const normalizedEmail = normalize(email);

  if (!normalizedEmail) {
    return false;
  }

  const raw = sessionStorage.getItem(
    REGISTRATION_VERIFICATION_PENDING_KEY
  );

  if (!raw) {
    return false;
  }

  try {
    const pending =
      JSON.parse(raw) as PendingRegistrationVerification;

    /*
     * Remove stale registration state.
     */
    if (
      !pending.createdAt ||
      Date.now() - pending.createdAt >
        REGISTRATION_MAX_AGE_MS
    ) {
      sessionStorage.removeItem(
        REGISTRATION_VERIFICATION_PENDING_KEY
      );

      return false;
    }

    return (
      normalize(pending.email) ===
      normalizedEmail
    );
  } catch {
    sessionStorage.removeItem(
      REGISTRATION_VERIFICATION_PENDING_KEY
    );

    return false;
  }
}

export function clearRegistrationVerificationPending() {
  sessionStorage.removeItem(
    REGISTRATION_VERIFICATION_PENDING_KEY
  );
}

/* =========================================================
   STEP 2:
   REGISTRATION OTP HAS BEEN SUCCESSFULLY VERIFIED
========================================================= */

export function markProductTourPendingAfterSignup(
  identity: TourUserIdentity
) {
  const userId = normalize(
    identity.userId
  );

  const email = normalize(
    identity.email
  );

  if (!userId && !email) {
    console.warn(
      "[Walkthrough] Could not mark signup tour because user identity is missing."
    );

    return;
  }

  const pending: PendingSignupTour = {
    userId,
    email,
    createdAt: Date.now(),
  };

  sessionStorage.setItem(
    SIGNUP_TOUR_PENDING_KEY,
    JSON.stringify(pending)
  );
}

/* =========================================================
   CHECK WHETHER CURRENT USER SHOULD AUTO-START TOUR
========================================================= */

export function isProductTourPendingForUser(
  identity: TourUserIdentity
) {
  const raw = sessionStorage.getItem(
    SIGNUP_TOUR_PENDING_KEY
  );

  if (!raw) {
    return false;
  }

  try {
    const pending =
      JSON.parse(raw) as PendingSignupTour;

    /*
     * Prevent stale signup flags from triggering
     * a walkthrough much later.
     */
    if (
      !pending.createdAt ||
      Date.now() - pending.createdAt >
        SIGNUP_TOUR_MAX_AGE_MS
    ) {
      sessionStorage.removeItem(
        SIGNUP_TOUR_PENDING_KEY
      );

      return false;
    }

    const currentUserId =
      normalize(identity.userId);

    const currentEmail =
      normalize(identity.email);

    /*
     * Prefer matching user ID.
     */
    if (
      pending.userId &&
      currentUserId &&
      pending.userId === currentUserId
    ) {
      return true;
    }

    /*
     * Email fallback.
     */
    if (
      pending.email &&
      currentEmail &&
      pending.email === currentEmail
    ) {
      return true;
    }

    return false;
  } catch {
    sessionStorage.removeItem(
      SIGNUP_TOUR_PENDING_KEY
    );

    return false;
  }
}

/* =========================================================
   REMOVE SIGNUP AUTO-START FLAG
========================================================= */

export function clearProductTourSignupFlag() {
  sessionStorage.removeItem(
    SIGNUP_TOUR_PENDING_KEY
  );
}

/* =========================================================
   USER-SPECIFIC WALKTHROUGH STORAGE KEY
========================================================= */

export function getTourUserKey(
  identity: TourUserIdentity
) {
  return (
    normalize(identity.userId) ||
    normalize(identity.email)
  );
}

export const MANUAL_TOUR_PENDING_KEY =
  "tract:product-tour:manual-pending";

export function markManualTourPending(
  role: "seller" | "partner" | "realtor"
) {
  sessionStorage.setItem(
    MANUAL_TOUR_PENDING_KEY,
    role
  );
}

export function isManualTourPending(
  role: "seller" | "partner" | "realtor"
) {
  return (
    sessionStorage.getItem(
      MANUAL_TOUR_PENDING_KEY
    ) === role
  );
}

export function clearManualTourPending() {
  sessionStorage.removeItem(
    MANUAL_TOUR_PENDING_KEY
  );
}