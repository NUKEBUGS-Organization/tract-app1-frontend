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

import {
  PARTNER_ROLES,
  REALTOR_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../constants/roles";

import { getRoleFromToken } from "../redux/auth/jwtUtils";

import {
  BUYER_TOUR_VERSION,
  getBuyerTourSteps,
  type BuyerTourRole,
} from "./buyerTourSteps";

export default function BuyerWalkthrough() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    role,
    accessToken,
    authReady,
  } = useAuthContext();

  const driverRef =
    useRef<ReturnType<typeof driver> | null>(
      null
    );

  /* =======================================================
     ROLE
  ======================================================= */

  const userRole = normalizeRole(
    role || getRoleFromToken(accessToken)
  );

  const isPartner = isAllowedRole(
    userRole,
    PARTNER_ROLES
  );

  const isRealtor = isAllowedRole(
    userRole,
    REALTOR_ROLES
  );

  const walkthroughRole:
    | BuyerTourRole
    | null = isRealtor
    ? "realtor"
    : isPartner
      ? "partner"
      : null;

  const steps = useMemo(() => {
    if (!walkthroughRole) {
      return [];
    }

    return getBuyerTourSteps(
      walkthroughRole
    );
  }, [walkthroughRole]);

  /* =======================================================
     USER-SPECIFIC STORAGE
  ======================================================= */

  const userKey = useMemo(() => {
    const currentUser = user as any;

    return String(
      currentUser?._id ||
        currentUser?.id ||
        currentUser?.email ||
        walkthroughRole ||
        "buyer"
    );
  }, [user, walkthroughRole]);

  const completedKey = useMemo(() => {
    if (!walkthroughRole) {
      return "";
    }

    return `tract:${walkthroughRole}-tour:v${BUYER_TOUR_VERSION}:${userKey}:completed`;
  }, [walkthroughRole, userKey]);

  const progressKey = useMemo(() => {
    if (!walkthroughRole) {
      return "";
    }

    return `tract:${walkthroughRole}-tour:v${BUYER_TOUR_VERSION}:${userKey}:progress`;
  }, [walkthroughRole, userKey]);

  /* =======================================================
     FINISH / SKIP
  ======================================================= */

  const completeTour = useCallback(() => {
    if (completedKey) {
      localStorage.setItem(
        completedKey,
        "true"
      );
    }

    if (progressKey) {
      sessionStorage.removeItem(
        progressKey
      );
    }

    if (driverRef.current) {
      driverRef.current.destroy();

      driverRef.current = null;
    }
  }, [completedKey, progressKey]);

  /* =======================================================
     START TOUR
  ======================================================= */

  const startTourAt = useCallback(
    (startIndex: number) => {
      if (!walkthroughRole) return;

      if (!steps.length) return;

      if (
        driverRef.current &&
        driverRef.current.isActive()
      ) {
        return;
      }

      const safeIndex =
        startIndex >= 0 &&
        startIndex < steps.length
          ? startIndex
          : 0;

      let driverObj:
        ReturnType<typeof driver>;

      /* ---------------------------------------------------
         ROUTE CHANGE
      --------------------------------------------------- */

      function moveToRouteStep(
        targetIndex: number
      ) {
        const targetStep =
          steps[targetIndex];

        if (!targetStep) return;

        sessionStorage.setItem(
          progressKey,
          String(targetIndex)
        );

        driverObj.destroy();

        driverRef.current = null;

        navigate(targetStep.route);
      }

      /* ---------------------------------------------------
         DRIVER STEPS
      --------------------------------------------------- */

      const driverSteps = steps.map(
        (tourStep, index) => {
          const nextStep =
            steps[index + 1];

          const previousStep =
            steps[index - 1];

          return {
            ...(tourStep.element
              ? {
                  element:
                    tourStep.element,

                  waitForElement: 7000,
                }
              : {}),

            popover: {
              title: tourStep.title,

              description:
                tourStep.description,

              side:
                tourStep.side ??
                "bottom",

              align:
                tourStep.align ??
                "start",

              onNextClick: () => {
                if (!nextStep) {
                  completeTour();
                  return;
                }

                if (
                  nextStep.route ===
                  tourStep.route
                ) {
                  driverObj.moveNext();
                  return;
                }

                moveToRouteStep(
                  index + 1
                );
              },

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

                moveToRouteStep(
                  index - 1
                );
              },
            },
          };
        }
      );

      driverObj = driver({
        steps: driverSteps,

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

        disableActiveInteraction: true,

        allowClose: false,

        overlayOpacity: 0.68,

        stagePadding: 10,

        stageRadius: 14,

        popoverClass:
          "tract-driver-popover",

        onHighlighted: (
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
              String(options.index)
            );
          }
        },

        onCloseClick: () => {
          completeTour();
        },

        onDoneClick: () => {
          completeTour();
        },
      });

      driverRef.current = driverObj;

      driverObj.drive(safeIndex);
    },
    [
      walkthroughRole,
      steps,
      progressKey,
      navigate,
      completeTour,
    ]
  );

  /* =======================================================
     FIRST-TIME START / RESUME
  ======================================================= */

  useEffect(() => {
    if (!authReady) return;

    if (!walkthroughRole) return;

    if (!steps.length) return;

    if (!completedKey || !progressKey) {
      return;
    }

    const alreadyCompleted =
      localStorage.getItem(
        completedKey
      ) === "true";

    if (alreadyCompleted) {
      return;
    }

    const storedProgress =
      sessionStorage.getItem(
        progressKey
      );

    let stepIndex = 0;

    if (storedProgress !== null) {
      const parsed =
        Number(storedProgress);

      if (
        Number.isFinite(parsed) &&
        parsed >= 0 &&
        parsed < steps.length
      ) {
        stepIndex = parsed;
      }
    }

    const step =
      steps[stepIndex];

    if (!step) return;

    /*
     * Resume on required route.
     */

    if (
      storedProgress !== null &&
      location.pathname !==
        step.route
    ) {
      navigate(step.route, {
        replace: true,
      });

      return;
    }

    /*
     * Brand-new walkthrough begins only
     * from dashboard.
     */

    if (
      storedProgress === null &&
      location.pathname !==
        "/dashboard"
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        startTourAt(stepIndex);
      }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    authReady,
    walkthroughRole,
    completedKey,
    progressKey,
    location.pathname,
    navigate,
    startTourAt,
    steps,
  ]);

  /* =======================================================
     MANUAL RESTART

     Browser console:

     window.dispatchEvent(
       new Event("tract:start-buyer-tour")
     );
  ======================================================= */

  useEffect(() => {
    function restartTour() {
      if (!walkthroughRole) {
        return;
      }

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
        location.pathname !==
        "/dashboard"
      ) {
        navigate("/dashboard");

        return;
      }

      window.setTimeout(() => {
        startTourAt(0);
      }, 100);
    }

    window.addEventListener(
      "tract:start-buyer-tour",
      restartTour
    );

    return () => {
      window.removeEventListener(
        "tract:start-buyer-tour",
        restartTour
      );
    };
  }, [
    walkthroughRole,
    completedKey,
    progressKey,
    location.pathname,
    navigate,
    startTourAt,
  ]);

  return null;
}