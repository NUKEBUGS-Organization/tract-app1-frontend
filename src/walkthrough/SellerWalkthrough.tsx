import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useLocation, useNavigate } from "react-router";

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

export default function SellerWalkthrough() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    role,
    accessToken,
    authReady,
  } = useAuthContext();

  const driverRef =
    useRef<ReturnType<typeof driver> | null>(null);

  const userRole = normalizeRole(
    role || getRoleFromToken(accessToken)
  );

  const isSeller = isAllowedRole(
    userRole,
    SELLER_ROLES
  );

  // ---------------------------------------------------------
  // Build a unique key for each user.
  // This prevents two accounts on the same browser from
  // sharing walkthrough completion state.
  // ---------------------------------------------------------

  const userKey = useMemo(() => {
    const currentUser = user as any;

    return String(
      currentUser?._id ||
      currentUser?.id ||
      currentUser?.email ||
      "seller"
    );
  }, [user]);

  const completedKey = useMemo(
    () =>
      `tract:seller-tour:v${SELLER_TOUR_VERSION}:${userKey}:completed`,
    [userKey]
  );

  const progressKey = useMemo(
    () =>
      `tract:seller-tour:v${SELLER_TOUR_VERSION}:${userKey}:progress`,
    [userKey]
  );

  // ---------------------------------------------------------
  // Complete / Skip tour
  // ---------------------------------------------------------

  const completeTour = useCallback(() => {
    localStorage.setItem(completedKey, "true");
    sessionStorage.removeItem(progressKey);

    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
  }, [completedKey, progressKey]);

  // ---------------------------------------------------------
  // Start Driver.js at a particular step
  // ---------------------------------------------------------

  const startTourAt = useCallback(
    (startIndex: number) => {
      if (!isSeller) return;

      if (
        driverRef.current &&
        driverRef.current.isActive()
      ) {
        return;
      }

      const safeIndex =
        startIndex >= 0 &&
        startIndex < sellerTourSteps.length
          ? startIndex
          : 0;

      let driverObj: ReturnType<typeof driver>;

      // -----------------------------------------------------
      // Move to a step that lives on another React route
      // -----------------------------------------------------

      const moveToRouteStep = (
        targetIndex: number
      ) => {
        const targetStep =
          sellerTourSteps[targetIndex];

        if (!targetStep) return;

        // Remember where the tour must resume.
        sessionStorage.setItem(
          progressKey,
          String(targetIndex)
        );

        // Destroy current page's Driver instance.
        driverObj.destroy();
        driverRef.current = null;

        // React Router navigation.
        navigate(targetStep.route);
      };

      // -----------------------------------------------------
      // Build Driver.js steps
      // -----------------------------------------------------

      const steps = sellerTourSteps.map(
        (tourStep, index) => {
          const nextStep =
            sellerTourSteps[index + 1];

          const previousStep =
            sellerTourSteps[index - 1];

          return {
            ...(tourStep.element
              ? {
                  element: tourStep.element,

                  // Some TRACT pages render after RTK Query
                  // finishes loading.
                  waitForElement: 7000,
                }
              : {}),

            popover: {
              title: tourStep.title,
              description:
                tourStep.description,

              side:
                tourStep.side ?? "bottom",

              align:
                tourStep.align ?? "start",

              // ---------------------------------------------
              // NEXT
              // ---------------------------------------------

              onNextClick: () => {
                if (!nextStep) {
                  completeTour();
                  return;
                }

                // Same route:
                // simply continue Driver.js.
                if (
                  nextStep.route ===
                  tourStep.route
                ) {
                  driverObj.moveNext();
                  return;
                }

                // Different route:
                // save progress and navigate.
                moveToRouteStep(index + 1);
              },

              // ---------------------------------------------
              // BACK
              // ---------------------------------------------

              onPrevClick: () => {
                if (!previousStep) {
                  return;
                }

                if (
                  previousStep.route ===
                  tourStep.route
                ) {
                  driverObj.movePrevious();
                  return;
                }

                moveToRouteStep(index - 1);
              },
            },
          };
        }
      );

      driverObj = driver({
        steps,

        animate: true,
        duration: 350,

        smoothScroll: true,

        showProgress: true,
        progressText:
          "{{current}} of {{total}}",

        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Finish Tour",

        showButtons: [
          "previous",
          "next",
          "close",
        ],

        // Don't let users accidentally manipulate actual
        // business actions while learning the interface.
        disableActiveInteraction: true,

        // Prevent accidental overlay click closing.
        allowClose: false,

        overlayOpacity: 0.68,

        stagePadding: 10,
        stageRadius: 14,

        popoverClass:
          "tract-driver-popover",

        // ---------------------------------------------------
        // Keep current position stored.
        // This lets the tour recover from reload/navigation.
        // ---------------------------------------------------

        onHighlighted: (
          _element,
          _step,
          options
        ) => {
          if (
            typeof options.index === "number"
          ) {
            sessionStorage.setItem(
              progressKey,
              String(options.index)
            );
          }
        },

        // ---------------------------------------------------
        // X button = skip tour
        // ---------------------------------------------------

        onCloseClick: () => {
          completeTour();
        },

        // ---------------------------------------------------
        // Final button
        // ---------------------------------------------------

        onDoneClick: () => {
          completeTour();
        },
      });

      driverRef.current = driverObj;

      driverObj.drive(safeIndex);
    },
    [
      completeTour,
      isSeller,
      navigate,
      progressKey,
    ]
  );

  // ---------------------------------------------------------
  // AUTOMATIC FIRST-TIME START
  // ---------------------------------------------------------

  useEffect(() => {
    if (!authReady) return;
    if (!isSeller) return;

    const alreadyCompleted =
      localStorage.getItem(completedKey) ===
      "true";

    if (alreadyCompleted) {
      return;
    }

    const storedProgress =
      sessionStorage.getItem(progressKey);

    let stepIndex = 0;

    if (storedProgress !== null) {
      const parsed = Number(storedProgress);

      if (
        Number.isFinite(parsed) &&
        parsed >= 0 &&
        parsed < sellerTourSteps.length
      ) {
        stepIndex = parsed;
      }
    }

    const step =
      sellerTourSteps[stepIndex];

    if (!step) return;

    // -------------------------------------------------------
    // If we're resuming a tour and we're on the wrong page,
    // take the user back to the required route.
    // -------------------------------------------------------

    if (
      storedProgress !== null &&
      location.pathname !== step.route
    ) {
      navigate(step.route, {
        replace: true,
      });

      return;
    }

    // Brand-new tour should begin only from dashboard.
    if (
      storedProgress === null &&
      location.pathname !== "/dashboard"
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      startTourAt(stepIndex);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    authReady,
    isSeller,
    completedKey,
    progressKey,
    location.pathname,
    navigate,
    startTourAt,
  ]);

  // ---------------------------------------------------------
  // DEVELOPMENT / HELP MENU RESTART EVENT
  //
  // Run this in browser console:
  //
  // window.dispatchEvent(
  //   new Event("tract:start-seller-tour")
  // );
  // ---------------------------------------------------------

  useEffect(() => {
    const restartTour = () => {
      if (!isSeller) return;

      localStorage.removeItem(
        completedKey
      );

      sessionStorage.setItem(
        progressKey,
        "0"
      );

      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }

      if (
        location.pathname !== "/dashboard"
      ) {
        navigate("/dashboard");
        return;
      }

      window.setTimeout(() => {
        startTourAt(0);
      }, 100);
    };

    window.addEventListener(
      "tract:start-seller-tour",
      restartTour
    );

    return () => {
      window.removeEventListener(
        "tract:start-seller-tour",
        restartTour
      );
    };
  }, [
    completedKey,
    progressKey,
    isSeller,
    location.pathname,
    navigate,
    startTourAt,
  ]);

  // No visible React component.
  return null;
}