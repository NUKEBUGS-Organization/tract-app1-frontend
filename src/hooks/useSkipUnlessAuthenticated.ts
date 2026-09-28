import { useAuthContext } from "../contexts/AuthContext";

/**
 * Shared skip gate for authenticated RTK Query hooks.
 * Queries must not fire until the silent boot refresh finishes and a session exists.
 */
export function useSkipUnlessAuthenticated() {
  const { isAuthenticated, authReady } = useAuthContext();
  return !authReady || !isAuthenticated;
}
