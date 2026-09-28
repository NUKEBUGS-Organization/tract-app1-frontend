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
  SELLER_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../constants/roles";

import {
  SELLER_TOUR_VERSION,
  sellerTourSteps,
} from "./sellerTourSteps";

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

export default function SellerWalkthrough() {
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
   * Local reference to this Seller walkthrough's
   * Driver.js instance.
   */
  const driverRef =
    useRef<ReturnType<typeof driver> | null>(null);

  /*
   * True while the Seller walkthrough is intentionally
   * running across different React Router pages.
   *
   * This can be triggered by:
   * 1. Automatic walkthrough after signup.
   * 2. Manual "Get Walkthrough" button.
   */
  const tourActiveRef = useRef(false);

  /* =====================================================
     ROLE
  ===================================================== */

  const userRole = normalizeRole(
    role || getRoleFromToken(accessToken)
  );

  const isSeller = isAllowedRole(
    userRole,
    SELLER_ROLES
  );

  /* =====================================================
     USER IDENTITY
  ===================================================== */

  const identity = useMemo(() => {
    const currentUser = user as any;

    return {
      userId:
        currentUser?._id ||
        currentUser?.id ||
        "",

      email:
        currentUser?.email ||
        "",
    };
  }, [user]);

  /*
   * Prefer user ID.
   * Email is used as fallback.
   */
  const userKey = useMemo(
    () => getTourUserKey(identity),
    [identity]
  );

  /* =====================================================
     STORAGE KEYS
  ===================================================== */

  /*
   * Permanent browser flag:
   *
   * Once Seller completes OR skips this version,
   * automatic walkthrough will not appear again.
   */
  const completedKey = useMemo(() => {
    if (!userKey) {
      return "";
    }

    return `tract:seller-tour:v${SELLER_TOUR_VERSION}:${userKey}:completed`;
  }, [
    userKey,
  ]);

  /*
   * Temporary session progress:
   *
   * Allows the walkthrough to continue correctly when
   * React Router changes from one page to another.
   */
  const progressKey = useMemo(() => {
    if (!userKey) {
      return "";
    }

    return `tract:seller-tour:v${SELLER_TOUR_VERSION}:${userKey}:progress`;
  }, [
    userKey,
  ]);

  /* =====================================================
     FINISH / SKIP ENTIRE TOUR
  ===================================================== */

  const endTour = useCallback(() => {
    /*
     * Both Finish and Skip mean that the automatic
     * walkthrough has been handled.
     */
    if (completedKey) {
      localStorage.setItem(
        completedKey,
        "true"
      );
    }

    /*
     * Remove current step progress.
     */
    if (progressKey) {
      sessionStorage.removeItem(
        progressKey
      );
    }

    /*
     * Consume the special signup-only automatic
     * walkthrough flag.
     */
    clearProductTourSignupFlag();

    /*
     * Remove manual replay flag if this tour was
     * launched from "Get Walkthrough".
     */
    clearManualTourPending();

    /*
     * Tour has completely ended.
     */
    tourActiveRef.current = false;

    /*
     * Destroy whichever Driver instance is currently
     * globally active.
     *
     * This prevents old/stuck Driver popovers.
     */
    destroyActiveTourDriver();

    driverRef.current = null;
  }, [
    completedKey,
    progressKey,
  ]);

  /* =====================================================
     START WALKTHROUGH AT A PARTICULAR STEP
  ===================================================== */

  const startTourAt = useCallback(
    (
      startIndex: number
    ) => {
      /*
       * Seller controller should do nothing for
       * Wholesaler/Realtor/Admin.
       */
      if (!isSeller) {
        return;
      }

      /*
       * Wait until authenticated user identity exists.
       */
      if (!userKey) {
        return;
      }

      /*
       * GLOBAL DUPLICATE PROTECTION
       *
       * Prevents two Driver.js instances from rendering
       * at the same time.
       */
      if (
        hasActiveTourDriver()
      ) {
        return;
      }

      /*
       * Local duplicate protection as an extra safeguard.
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
          sellerTourSteps.length
          ? startIndex
          : 0;

      let driverObj:
        ReturnType<typeof driver>;

      /* =================================================
         MOVE TO A STEP ON ANOTHER ROUTE
      ================================================= */

      const moveToRouteStep = (
        targetIndex: number
      ) => {
        const targetStep =
          sellerTourSteps[
            targetIndex
          ];

        if (!targetStep) {
          return;
        }

        /*
         * Store the step to resume after navigation.
         */
        sessionStorage.setItem(
          progressKey,
          String(
            targetIndex
          )
        );

        /*
         * IMPORTANT:
         *
         * Destroy current Driver BEFORE navigating.
         * Otherwise an old modal can remain on screen
         * while the destination page creates another.
         */
        driverObj.destroy();

        clearActiveTourDriver(
          driverObj
        );

        driverRef.current =
          null;

        /*
         * Do NOT set:
         *
         * tourActiveRef.current = false
         *
         * because the tour isn't finished.
         * We're only moving to another page.
         */

        navigate(
          targetStep.route
        );
      };

      /* =================================================
         BUILD DRIVER.JS STEPS
      ================================================= */

      const steps =
        sellerTourSteps.map(
          (
            tourStep,
            index
          ) => {
            const nextStep =
              sellerTourSteps[
                index + 1
              ];

            const previousStep =
              sellerTourSteps[
                index - 1
              ];

            return {
              ...(tourStep.element
                ? {
                    element:
                      tourStep.element,

                    /*
                     * Wait briefly for dynamic React UI.
                     */
                    waitForElement:
                      5000,
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

                /* ======================================
                   NEXT BUTTON
                ====================================== */

                onNextClick:
                  () => {
                    /*
                     * No next step means walkthrough
                     * is complete.
                     */
                    if (
                      !nextStep
                    ) {
                      endTour();

                      return;
                    }

                    /*
                     * Same page:
                     * Driver can simply move forward.
                     */
                    if (
                      nextStep.route ===
                      tourStep.route
                    ) {
                      driverObj.moveNext();

                      return;
                    }

                    /*
                     * Different application page.
                     */
                    moveToRouteStep(
                      index + 1
                    );
                  },

                /* ======================================
                   PREVIOUS BUTTON
                ====================================== */

                onPrevClick:
                  () => {
                    if (
                      !previousStep
                    ) {
                      return;
                    }

                    /*
                     * Same page.
                     */
                    if (
                      previousStep.route ===
                      tourStep.route
                    ) {
                      driverObj.movePrevious();

                      return;
                    }

                    /*
                     * Previous step exists on another
                     * React Router route.
                     */
                    moveToRouteStep(
                      index - 1
                    );
                  },
              },
            };
          }
        );

      /* =================================================
         CREATE DRIVER.JS INSTANCE
      ================================================= */

      driverObj = driver({
        steps,

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

        /*
         * Driver buttons.
         *
         * We additionally add our custom
         * Skip Tour button below.
         */
        showButtons: [
          "previous",
          "next",
          "close",
        ],

        /*
         * Don't allow accidental interaction with
         * the highlighted application control.
         */
        disableActiveInteraction:
          true,

        /*
         * If an optional walkthrough target doesn't
         * exist, don't crash the entire tour.
         */
        skipMissingElement:
          true,

        /*
         * We control closing ourselves so clicking X
         * is treated as skipping the entire walkthrough.
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

        /* =============================================
           SKIP TOUR BUTTON ON EVERY MODAL
        ============================================= */

        onPopoverRender:
          (
            popover
          ) => {
            /*
             * Driver may re-render a popover.
             * Don't insert duplicate Skip buttons.
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
                 * Ends ALL remaining walkthrough steps.
                 */
                endTour();
              },
              {
                once:
                  true,
              }
            );

            /*
             * Put Skip Tour before Back / Next.
             */
            popover.footerButtons.prepend(
              skipButton
            );
          },

        /* =============================================
           SAVE CURRENT STEP
        ============================================= */

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
         * X button = skip entire walkthrough.
         */
        onCloseClick:
          () => {
            endTour();
          },

        /*
         * Final Finish Tour button.
         */
        onDoneClick:
          () => {
            endTour();
          },
      });

      /*
       * Save local Driver reference.
       */
      driverRef.current =
        driverObj;

      /*
       * Save global Driver reference.
       *
       * This is what prevents the duplicate popup
       * issue you had earlier.
       */
      setActiveTourDriver(
        driverObj
      );

      /*
       * Tour is now actively running.
       */
      tourActiveRef.current =
        true;

      /*
       * Start/resume at requested step.
       */
      driverObj.drive(
        safeIndex
      );
    },
    [
      endTour,
      isSeller,
      navigate,
      progressKey,
      userKey,
    ]
  );

  /* =====================================================
     AUTOMATIC WALKTHROUGH

     IMPORTANT:
     THIS ONLY STARTS AFTER A NEW REGISTRATION.

     A normal SignIn does NOT create signupPending.
  ===================================================== */

  useEffect(() => {
    /*
     * Authentication hasn't finished loading.
     */
    if (!authReady) {
      return;
    }

    /*
     * Must actually be logged in.
     */
    if (!isAuthenticated) {
      return;
    }

    /*
     * This controller is Seller-only.
     */
    if (!isSeller) {
      return;
    }

    /*
     * Need a stable user ID/email before storing
     * walkthrough state.
     */
    if (!userKey) {
      return;
    }

    /*
     * Created by Verify.tsx only after successful
     * NEW ACCOUNT registration + OTP.
     */
    const signupPending =
      isProductTourPendingForUser(
        identity
      );

    /*
     * Created when the user previously finished
     * or skipped this walkthrough version.
     */
    const completed =
      localStorage.getItem(
        completedKey
      ) === "true";

    /*
     * Created when the user explicitly clicks
     * "Get Walkthrough" in the sidebar.
     */
    const manualPending =
      isManualTourPending(
        "seller"
      );

    /* =================================================
       DECIDE WHETHER A TOUR SHOULD RUN
    ================================================= */

    if (
      !tourActiveRef.current
    ) {
      /*
       * Neither:
       *
       * - newly registered
       * - manually requested
       *
       * Therefore do NOTHING.
       *
       * This is what prevents normal login from
       * automatically showing the walkthrough.
       */
      if (
        !signupPending &&
        !manualPending
      ) {
        return;
      }

      /*
       * completed=true blocks automatic signup
       * walkthrough.
       *
       * But it does NOT block a manual replay.
       */
      if (
        signupPending &&
        completed &&
        !manualPending
      ) {
        /*
         * Remove any stale signup marker.
         */
        clearProductTourSignupFlag();

        return;
      }

      tourActiveRef.current =
        true;
    }

    /* =================================================
       DETERMINE WHICH STEP TO SHOW
    ================================================= */

    let stepIndex =
      0;

    const storedProgress =
      sessionStorage.getItem(
        progressKey
      );

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
          sellerTourSteps.length
      ) {
        stepIndex =
          parsed;
      }
    } else {
      /*
       * New walkthrough starts from step 0.
       */
      sessionStorage.setItem(
        progressKey,
        "0"
      );
    }

    const step =
      sellerTourSteps[
        stepIndex
      ];

    if (!step) {
      return;
    }

    /* =================================================
       MULTI-PAGE ROUTE RESUME
    ================================================= */

    if (
      location.pathname !==
      step.route
    ) {
      /*
       * Move to the page required by this step.
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
     * Allow React page + data-tour elements to render.
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
    isSeller,
    userKey,
    identity,
    completedKey,
    progressKey,
    location.pathname,
    navigate,
    startTourAt,
  ]);

  /* =====================================================
     MANUAL "GET WALKTHROUGH" SIDEBAR BUTTON

     Event:
     tract:start-seller-tour

     This MUST work even if:
     completed = true
  ===================================================== */

  useEffect(() => {
    const startManualTour =
      () => {
        /*
         * Correct role only.
         */
        if (!isSeller) {
          return;
        }

        if (!userKey) {
          return;
        }

        /*
         * IMPORTANT:
         *
         * Persist manual request in sessionStorage.
         *
         * This means if we navigate from:
         *
         * /deals
         *      ↓
         * /dashboard
         *
         * the manual walkthrough request isn't lost.
         */
        markManualTourPending(
          "seller"
        );

        /*
         * Walkthrough is intentionally active.
         */
        tourActiveRef.current =
          true;

        /*
         * Manual replay always begins at step 0.
         */
        sessionStorage.setItem(
          progressKey,
          "0"
        );

        /*
         * Destroy any old Driver instance before
         * starting a fresh manual walkthrough.
         */
        destroyActiveTourDriver();

        driverRef.current =
          null;

        /* =============================================
           NOT CURRENTLY ON DASHBOARD
        ============================================= */

        if (
          location.pathname !==
          "/dashboard"
        ) {
          /*
           * Navigate first.
           *
           * The automatic/resume effect above will
           * notice manualPending after navigation
           * and start step 0.
           */
          navigate(
            "/dashboard"
          );

          return;
        }

        /* =============================================
           ALREADY ON DASHBOARD
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
      "tract:start-seller-tour",
      startManualTour
    );

    return () => {
      window.removeEventListener(
        "tract:start-seller-tour",
        startManualTour
      );
    };
  }, [
    isSeller,
    userKey,
    progressKey,
    location.pathname,
    navigate,
    startTourAt,
  ]);

  /* =====================================================
     COMPONENT CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      /*
       * Don't leave Driver modal/overlay behind when
       * DashboardLayout disappears.
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