"use client";

import { useEffect } from "react";

const SESSION_KEY = "property-view-session";
const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing && SESSION_ID_PATTERN.test(existing)) return existing;

  const sessionId = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function PropertyViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    void fetch(`/api/properties/${encodeURIComponent(propertyId)}/view`, {
      method: "POST",
      headers: { "x-view-session-id": getSessionId() },
      cache: "no-store",
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Property view tracking failed:", response.status);
        }
      })
      .catch((error: unknown) => {
        console.error("Property view tracking failed:", error);
      });
  }, [propertyId]);

  return null;
}
