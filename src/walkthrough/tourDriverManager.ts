import { driver } from "driver.js";

type TourDriver =
  ReturnType<typeof driver>;

let activeTourDriver:
  TourDriver | null = null;

export function hasActiveTourDriver() {
  return Boolean(
    activeTourDriver &&
      activeTourDriver.isActive()
  );
}

export function setActiveTourDriver(
  nextDriver: TourDriver
) {
  if (
    activeTourDriver &&
    activeTourDriver !== nextDriver
  ) {
    try {
      activeTourDriver.destroy();
    } catch {
      // Ignore stale Driver instance.
    }
  }

  activeTourDriver =
    nextDriver;
}

export function destroyActiveTourDriver() {
  if (!activeTourDriver) {
    return;
  }

  try {
    activeTourDriver.destroy();
  } catch {
    // Ignore stale Driver instance.
  }

  activeTourDriver =
    null;
}

export function clearActiveTourDriver(
  instance: TourDriver
) {
  if (
    activeTourDriver ===
    instance
  ) {
    activeTourDriver =
      null;
  }
}