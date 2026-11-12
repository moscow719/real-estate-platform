"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addComparison,
  initializeComparisons,
  removeComparison,
} from "@/actions/comparison";
import {
  MAX_COMPARISON_PROPERTIES,
  type ComparisonActionError,
  type ComparisonMutationResult,
} from "@/lib/comparisons";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "real-estate-comparison";

type ComparisonContextValue = {
  ids: string[];
  isReady: boolean;
  isAuthenticated: boolean;
  isBusy: boolean;
  pendingCount: number;
  error: ComparisonActionError | "storage" | null;
  toggle: (propertyId: string) => Promise<ComparisonMutationResult>;
};

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

function readStoredIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];

    return [
      ...new Set(
        value.filter(
          (id): id is string =>
            typeof id === "string" && id.length > 0 && id.length <= 40
        )
      ),
    ]
      .slice(0, MAX_COMPARISON_PROPERTIES);
  } catch (error) {
    console.error("Unable to read comparison list from local storage", error);
    return [];
  }
}

function writeStoredIds(ids: string[]) {
  try {
    if (ids.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
    return true;
  } catch (error) {
    console.error("Unable to save comparison list to local storage", error);
    return false;
  }
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<ComparisonContextValue["error"]>(null);

  useEffect(() => {
    const previous = previousPath.current;
    previousPath.current = pathname;
    if (
      previous !== null &&
      !previous.endsWith("/login") &&
      !previous.endsWith("/register")
    ) {
      return;
    }

    let active = true;

    async function initialize() {
      setIsReady(false);
      const guestIds = readStoredIds();
      setIds(guestIds);

      try {
        const result = await initializeComparisons(guestIds);
        if (!active) return;

        if (!result.ok && result.error === "unauthorized") {
          setIsAuthenticated(false);
          setIsReady(true);
          return;
        }
        if (!result.ok) {
          setIsAuthenticated(true);
          setError(result.error);
          setIsReady(true);
          return;
        }

        setIsAuthenticated(true);
        setIds(result.ids);
        setPendingCount(result.pendingIds.length);
        if (!writeStoredIds(result.pendingIds)) {
          setError("storage");
        }
        setIsReady(true);
      } catch (caught) {
        console.error("Unable to initialize property comparisons", caught);
        if (active) {
          setError("failed");
          setIsReady(true);
        }
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, [pathname]);

  const toggle = useCallback(
    async (propertyId: string): Promise<ComparisonMutationResult> => {
      if (!isReady || isBusy) return { ok: false, error: "invalid" };

      setIsBusy(true);
      setError(null);
      try {
        const isSelected = ids.includes(propertyId);
        if (!isAuthenticated) {
          if (!isSelected && ids.length >= MAX_COMPARISON_PROPERTIES) {
            setError("limit");
            return { ok: false, error: "limit" };
          }

          const nextIds = isSelected
            ? ids.filter((id) => id !== propertyId)
            : [...ids, propertyId];
          setIds(nextIds);
          if (!writeStoredIds(nextIds)) setError("storage");
          return { ok: true, ids: nextIds };
        }

        const result = isSelected
          ? await removeComparison(propertyId)
          : await addComparison(propertyId);
        if (!result.ok) {
          setError(result.error);
          return result;
        }

        setIds(result.ids);
        if (isSelected) {
          const pendingIds = readStoredIds();
          if (pendingIds.length > 0) {
            const synced = await initializeComparisons(pendingIds);
            if (synced.ok) {
              setIds(synced.ids);
              setPendingCount(synced.pendingIds.length);
              if (!writeStoredIds(synced.pendingIds)) setError("storage");
            } else {
              setError(synced.error);
            }
          }
        }

        return result;
      } catch (caught) {
        console.error("Unable to update property comparisons", caught);
        setError("failed");
        return { ok: false, error: "failed" };
      } finally {
        setIsBusy(false);
      }
    },
    [ids, isAuthenticated, isBusy, isReady]
  );

  return (
    <ComparisonContext.Provider
      value={{
        ids,
        isReady,
        isAuthenticated,
        isBusy,
        pendingCount,
        error,
        toggle,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparisons() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparisons must be used within ComparisonProvider");
  }
  return context;
}
