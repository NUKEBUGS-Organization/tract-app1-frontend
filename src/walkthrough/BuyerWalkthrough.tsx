import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { useAuthContext } from "../contexts/AuthContext";
import { getRoleFromToken } from "../redux/auth/jwtUtils";

import {
  PARTNER_ROLES,
  REALTOR_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../constants/roles";

import { useGetListingsQuery } from "../services/listingService";

import {
  BUYER_TOUR_VERSION,
  getBuyerTourSteps,
  type BuyerTourRole,
} from "./buyerTourSteps";

import {
  clearManualTourPending,
  clearProductTourSignupFlag,
  getTourUserKey,
  isManualTourPending,
  isProductTourPendingForUser,
  markManualTourPending,
} from "./tourStorage";

import {
  clearActiveTourDriver,
  destroyActiveTourDriver,
  hasActiveTourDriver,
  setActiveTourDriver,
} from "./tourDriverManager";

export default function BuyerWalkthrough() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    role,
    accessToken,
    authReady,
    isAuthenticated,
  } = useAuthContext();

  /*
   * Local reference to this walkthrough's
   * Driver.js instance.
   */
  const driverRef =
    useRef<ReturnType<typeof driver> | null>(
      null
    );

  /*
   * True while Wholesaler/Realtor walkthrough
   * is intentionally running.
   *
   * It stays true while moving between routes.
   */
  const tourActiveRef =
    useRef(false);

  /* =====================================================
     ROLE
  ===================================================== */

  const userRole =
    normalizeRole(
      role ||
        getRoleFromToken(
          accessToken
        )
    );

  const isPartner =
    isAllowedRole(
      userRole,
      PARTNER_ROLES
    );

  const isRealtor =
    isAllowedRole(
      userRole,
      REALTOR_ROLES
    );

  /*
   * Realtor gets Realtor-specific walkthrough.
   *
   * Partner / Wholesaler gets Partner walkthrough.
   */
  const walkthroughRole:
    | BuyerTourRole
    | null = isRealtor
    ? "realtor"
    : isPartner
      ? "partner"
      : null;

  /* =====================================================
     LISTINGS AVAILABILITY FOR MARKETPLACE STEPS
  ===================================================== */

  const { data: listingsData } = useGetListingsQuery(
    { status: "live" },
    { skip: !walkthroughRole || !isAuthenticated }
  );

  const hasProperties = useMemo(() => {
    if (!listingsData) {
      return Boolean(
        typeof document !== "undefined" &&
          document.querySelector('[data-tour="property-card"]')
      );
    }

    const list = Array.isArray(listingsData)
      ? listingsData
      : Array.isArray(listingsData?.data)
      ? listingsData.data
      : Array.isArray(listingsData?.listings)
      ? listingsData.listings
      : Array.isArray(listingsData?.data?.listings)
      ? listingsData.data.listings
      : Array.isArray(listingsData?.data?.data)
      ? listingsData.data.data
      : [];

    return (
      list.length > 0 ||
      Boolean(
        typeof document !== "undefined" &&
          document.querySelector('[data-tour="property-card"]')
      )
    );
  }, [listingsData]);

  /* =====================================================
     ROLE-SPECIFIC STEPS
  ===================================================== */

  const steps = useMemo(() => {
    if (!walkthroughRole) {
      return [];
    }

    return getBuyerTourSteps(
      walkthroughRole,
      hasProperties
    );
  }, [
    walkthroughRole,
    hasProperties,
  ]);

  /* =====================================================
     USER IDENTITY
  ===================================================== */

  const identity = useMemo(() => {
    const currentUser =
      user as any;

    return {
      userId:
        currentUser?._id ||
        currentUser?.id ||
        "",

      email:
        currentUser?.email ||
        "",
    };
  }, [
    user,
  ]);

  /*
   * Prefer user ID.
   * Email is fallback.
   */
  const userKey = useMemo(
    () =>
      getTourUserKey(
        identity
      ),
    [
      identity,
    ]
  );

  /* =====================================================
     STORAGE KEYS
  ===================================================== */

  /*
   * Permanent completion key.
   *
   * Separate key for:
   *
   * partner
   * realtor
   *
   * and separate per user.
   */
  const completedKey =
    useMemo(() => {
      if (
        !walkthroughRole ||
        !userKey
      ) {
        return "";
      }

      return `tract:${walkthroughRole}-tour:v${BUYER_TOUR_VERSION}:${userKey}:completed`;
    }, [
      walkthroughRole,
      userKey,
    ]);

  /*
   * Temporary current-step storage.
   *
   * Needed when moving:
   *
   * Dashboard
   * → Properties
   * → My Bids
   * → Contracts
   * → Deals
   * → Chat
   */
  const progressKey =
    useMemo(() => {
      if (
        !walkthroughRole ||
        !userKey
      ) {
        return "";
      }

      return `tract:${walkthroughRole}-tour:v${BUYER_TOUR_VERSION}:${userKey}:progress`;
    }, [
      walkthroughRole,
      userKey,
    ]);

  /* =====================================================
     FINISH / SKIP ENTIRE WALKTHROUGH
  ===================================================== */

  const endTour =
    useCallback(() => {
      /*
       * Finish OR Skip means automatic walkthrough
       * has now been handled.
       */
      if (completedKey) {
        localStorage.setItem(
          completedKey,
          "true"
        );
      }

      /*
       * Clear current-step progress.
       */
      if (progressKey) {
        sessionStorage.removeItem(
          progressKey
        );
      }

      /*
       * Automatic-signup walkthrough has been consumed.
       */
      clearProductTourSignupFlag();

      /*
       * Manual "Get Walkthrough" request has also
       * been consumed.
       */
      clearManualTourPending();

      tourActiveRef.current =
        false;

      /*
       * Destroy any currently registered
       * Driver instance.
       *
       * Prevents duplicate/stuck popovers.
       */
      destroyActiveTourDriver();

      driverRef.current =
        null;
    }, [
      completedKey,
      progressKey,
    ]);

  /* =====================================================
     START WALKTHROUGH AT SPECIFIC STEP
  ===================================================== */

  const startTourAt =
    useCallback(
      (
        startIndex: number
      ) => {
        /*
         * Must be Partner or Realtor.
         */
        if (
          !walkthroughRole
        ) {
          return;
        }

        /*
         * Need stable authenticated user.
         */
        if (!userKey) {
          return;
        }

        /*
         * Need role-specific walkthrough steps.
         */
        if (!steps.length) {
          return;
        }

        /*
         * =================================================
         * GLOBAL DUPLICATE PROTECTION
         * =================================================
         *
         * Prevents two Driver.js walkthroughs
         * existing simultaneously.
         */
        if (
          hasActiveTourDriver()
        ) {
          return;
        }

        /*
         * Additional local protection.
         */
        if (
          driverRef.current &&
          driverRef.current.isActive()
        ) {
          return;
        }

        /*
         * Protect against invalid stored indexes.
         */
        const safeIndex =
          startIndex >= 0 &&
          startIndex <
            steps.length
            ? startIndex
            : 0;

        let driverObj:
          ReturnType<typeof driver>;

        /* =============================================
           MOVE BETWEEN ROUTES
        ============================================= */

        const moveToRouteStep =
          (
            targetIndex: number
          ) => {
            const targetStep =
              steps[
                targetIndex
              ];

            if (!targetStep) {
              return;
            }

            /*
             * Save next/previous step so that after
             * React Router changes the page,
             * walkthrough resumes correctly.
             */
            sessionStorage.setItem(
              progressKey,
              String(
                targetIndex
              )
            );

            /*
             * Destroy current popup BEFORE navigation.
             */
            driverObj.destroy();

            /*
             * Tell global manager this instance
             * is no longer active.
             */
            clearActiveTourDriver(
              driverObj
            );

            driverRef.current =
              null;

            /*
             * IMPORTANT:
             *
             * Do not make tourActiveRef false.
             *
             * The tour is still running;
             * only the page is changing.
             */
            navigate(
              targetStep.route
            );
          };

        /* =============================================
           BUILD DRIVER STEPS
        ============================================= */

        const driverSteps =
          steps.map(
            (
              tourStep,
              index
            ) => {
              const nextStep =
                steps[
                  index + 1
                ];

              const previousStep =
                steps[
                  index - 1
                ];

              return {
                ...(tourStep.element
                  ? {
                      element:
                        tourStep.element,

                      /*
                       * Wait for React components/data
                       * to finish rendering.
                       */
                      waitForElement:
                        1500,
                    }
                  : {}),

                popover: {
                  title:
                    tourStep.title,

                  description:
                    tourStep.description,

                  side:
                    tourStep.side ??
                    "bottom",

                  align:
                    tourStep.align ??
                    "start",

                  /* =========================
                     NEXT
                  ========================= */

                  onNextClick:
                    () => {
                      /*
                       * Last step.
                       */
                      if (
                        !nextStep
                      ) {
                        endTour();

                        return;
                      }

                      /*
                       * Same application route.
                       */
                      if (
                        nextStep.route ===
                        tourStep.route
                      ) {
                        driverObj.moveNext();

                        return;
                      }

                      /*
                       * Different application route.
                       */
                      moveToRouteStep(
                        index + 1
                      );
                    },

                  /* =========================
                     BACK
                  ========================= */

                  onPrevClick:
                    () => {
                      if (
                        !previousStep
                      ) {
                        return;
                      }

                      /*
                       * Same application route.
                       */
                      if (
                        previousStep.route ===
                        tourStep.route
                      ) {
                        driverObj.movePrevious();

                        return;
                      }

                      /*
                       * Previous step is on
                       * another route.
                       */
                      moveToRouteStep(
                        index - 1
                      );
                    },
                },
              };
            }
          );

        /* =============================================
           CREATE DRIVER INSTANCE
        ============================================= */

        driverObj = driver({
          steps:
            driverSteps,

          animate:
            true,

          duration:
            350,

          smoothScroll:
            true,

          showProgress:
            true,

          progressText:
            "{{current}} of {{total}}",

          nextBtnText:
            "Next →",

          prevBtnText:
            "← Back",

          doneBtnText:
            "Finish Tour",

          showButtons: [
            "previous",
            "next",
            "close",
          ],

          /*
           * Prevent accidental application actions
           * while walkthrough is highlighting UI.
           */
          disableActiveInteraction:
            true,

          /*
           * Missing optional elements shouldn't
           * break the complete tour.
           */
          skipMissingElement:
            true,

          /*
           * Closing is handled by endTour().
           */
          allowClose:
            false,

          overlayOpacity:
            0.68,

          stagePadding:
            10,

          stageRadius:
            14,

          popoverClass:
            "tract-driver-popover",

          /* ===========================================
             SKIP TOUR BUTTON
          =========================================== */

          onPopoverRender:
            (
              popover
            ) => {
              /*
               * Driver can re-render popovers.
               *
               * Prevent duplicated Skip buttons.
               */
              const existing =
                popover.footerButtons.querySelector(
                  ".tract-tour-skip-btn"
                );

              if (existing) {
                return;
              }

              const skipButton =
                document.createElement(
                  "button"
                );

              skipButton.type =
                "button";

              skipButton.textContent =
                "Skip Tour";

              skipButton.className =
                "driver-popover-footer-btn tract-tour-skip-btn";

              skipButton.addEventListener(
                "click",
                () => {
                  /*
                   * Skip CURRENT and ALL remaining
                   * walkthrough steps.
                   */
                  endTour();
                },
                {
                  once:
                    true,
                }
              );

              /*
               * Place Skip before Back/Next.
               */
              popover.footerButtons.prepend(
                skipButton
              );
            },

          /* ===========================================
             SAVE STEP PROGRESS
          =========================================== */

          onHighlighted:
            (
              _element,
              _step,
              options
            ) => {
              if (
                typeof options.index ===
                "number"
              ) {
                sessionStorage.setItem(
                  progressKey,
                  String(
                    options.index
                  )
                );
              }
            },

          /*
           * X button also skips complete walkthrough.
           */
          onCloseClick:
            () => {
              endTour();
            },

          /*
           * Final button completes walkthrough.
           */
          onDoneClick:
            () => {
              endTour();
            },
        });

        /*
         * Save locally.
         */
        driverRef.current =
          driverObj;

        /*
         * Save globally.
         *
         * Prevents Seller/Buyer/old Driver
         * instances from overlapping.
         */
        setActiveTourDriver(
          driverObj
        );

        tourActiveRef.current =
          true;

        /*
         * Start/resume walkthrough.
         */
        driverObj.drive(
          safeIndex
        );
      },
      [
        walkthroughRole,
        userKey,
        steps,
        progressKey,
        navigate,
        endTour,
      ]
    );

  /* =====================================================
     AUTOMATIC WALKTHROUGH

     IMPORTANT:

     Auto-start happens ONLY after NEW SIGNUP.

     Normal SignIn does not create signupPending.
  ===================================================== */

  useEffect(() => {
    /*
     * Wait until AuthContext has finished.
     */
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    /*
     * Only Wholesaler/Partner/Realtor.
     */
    if (!walkthroughRole) {
      return;
    }

    if (!userKey) {
      return;
    }

    if (!steps.length) {
      return;
    }

    /*
     * Created only after:
     *
     * successful registration
     *       ↓
     * successful OTP
     *       ↓
     * markProductTourPendingAfterSignup()
     */
    const signupPending =
      isProductTourPendingForUser(
        identity
      );

    /*
     * User explicitly requested walkthrough
     * using sidebar button.
     */
    const manualPending =
      isManualTourPending(
        walkthroughRole
      );

    /*
     * User already Finished or Skipped
     * this version previously.
     */
    const completed =
      localStorage.getItem(
        completedKey
      ) === "true";

    /* =============================================
       DECIDE WHETHER TOUR SHOULD START
    ============================================= */

    if (
      !tourActiveRef.current
    ) {
      /*
       * Nothing requested the walkthrough.
       *
       * Normal login ends here.
       */
      if (
        !signupPending &&
        !manualPending
      ) {
        return;
      }

      /*
       * completed=true should block only
       * AUTOMATIC signup walkthrough.
       *
       * Manual "Get Walkthrough" must still work.
       */
      if (
        signupPending &&
        completed &&
        !manualPending
      ) {
        /*
         * Defensive cleanup in case a stale signup
         * marker remained in session storage.
         */
        clearProductTourSignupFlag();

        return;
      }

      tourActiveRef.current =
        true;
    }

    /* =============================================
       DETERMINE CURRENT STEP
    ============================================= */

    const storedProgress =
      sessionStorage.getItem(
        progressKey
      );

    let stepIndex =
      0;

    if (
      storedProgress !==
      null
    ) {
      const parsed =
        Number(
          storedProgress
        );

      if (
        Number.isFinite(
          parsed
        ) &&
        parsed >= 0 &&
        parsed <
          steps.length
      ) {
        stepIndex =
          parsed;
      }
    } else {
      /*
       * New walkthrough starts at first step.
       */
      sessionStorage.setItem(
        progressKey,
        "0"
      );
    }

    const step =
      steps[
        stepIndex
      ];

    if (!step) {
      return;
    }

    /* =============================================
       MULTI-PAGE RESUME
    ============================================= */

    if (
      location.pathname !==
      step.route
    ) {
      /*
       * Go to route required for current step.
       */
      navigate(
        step.route,
        {
          replace:
            true,
        }
      );

      return;
    }

    /*
     * Give React enough time to render page
     * and data-tour target.
     */
    const timer =
      window.setTimeout(
        () => {
          startTourAt(
            stepIndex
          );
        },
        450
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    authReady,
    isAuthenticated,
    walkthroughRole,
    userKey,
    identity,
    steps,
    completedKey,
    progressKey,
    location.pathname,
    navigate,
    startTourAt,
  ]);

  /* =====================================================
     MANUAL SIDEBAR "GET WALKTHROUGH"

     Event:
     tract:start-buyer-tour

     Works for:
     - Wholesaler / Partner
     - Realtor

     It works even if completed=true.
  ===================================================== */

  useEffect(() => {
    const startManualTour =
      () => {
        /*
         * Only Partner/Realtor.
         */
        if (
          !walkthroughRole
        ) {
          return;
        }

        if (!userKey) {
          return;
        }

        /*
         * =================================================
         * IMPORTANT MANUAL FLAG
         * =================================================
         *
         * Save the manual request in sessionStorage.
         *
         * Example:
         *
         * User is currently on /deals
         *
         * clicks "Get Walkthrough"
         *
         *      ↓
         *
         * manualPending = "partner"
         *
         *      ↓
         *
         * navigate("/dashboard")
         *
         *      ↓
         *
         * component can safely resume even if remounted.
         */
        markManualTourPending(
          walkthroughRole
        );

        /*
         * Walkthrough is intentionally running.
         */
        tourActiveRef.current =
          true;

        /*
         * Manual replay ALWAYS starts at step 0.
         */
        sessionStorage.setItem(
          progressKey,
          "0"
        );

        /*
         * Destroy old popup/Driver before starting.
         */
        destroyActiveTourDriver();

        driverRef.current =
          null;

        /* =============================================
           USER IS NOT ON DASHBOARD
        ============================================= */

        if (
          location.pathname !==
          "/dashboard"
        ) {
          navigate(
            "/dashboard"
          );

          /*
           * After navigation the main useEffect above
           * will detect manualPending and begin step 0.
           */
          return;
        }

        /* =============================================
           USER IS ALREADY ON DASHBOARD
        ============================================= */

        window.setTimeout(
          () => {
            startTourAt(
              0
            );
          },
          150
        );
      };

    window.addEventListener(
      "tract:start-buyer-tour",
      startManualTour
    );

    return () => {
      window.removeEventListener(
        "tract:start-buyer-tour",
        startManualTour
      );
    };
  }, [
    walkthroughRole,
    userKey,
    progressKey,
    location.pathname,
    navigate,
    startTourAt,
  ]);

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      /*
       * DashboardLayout is disappearing.
       *
       * Make sure no Driver popup remains stuck.
       */
      destroyActiveTourDriver();

      driverRef.current =
        null;

      tourActiveRef.current =
        false;
    };
  }, []);

  return null;
}