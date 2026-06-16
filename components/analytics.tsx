"use client";

import { useEffect } from "react";

type AnalyticsProvider = "plausible" | "umami" | "google" | "custom";

interface AnalyticsConfig {
  provider: AnalyticsProvider;
  src: string;
  dataDomain?: string;
  siteId?: string;
  measurementId?: string;
}

/**
 * Lightweight analytics script injector.
 * Supports: Plausible, Umami, Google Analytics 4, or any custom provider.
 *
 * Configure via environment variables:
 *   NEXT_PUBLIC_ANALYTICS_PROVIDER="plausible"   (default: empty = disabled)
 *   NEXT_PUBLIC_ANALYTICS_SRC="https://plausible.io/js/script.js"
 *   NEXT_PUBLIC_ANALYTICS_DOMAIN="yourdomain.com"
 *   NEXT_PUBLIC_ANALYTICS_SITE_ID=""
 *   NEXT_PUBLIC_ANALYTICS_MEASUREMENT_ID="G-XXXXXXXX"
 */
export function Analytics() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as
    | AnalyticsProvider
    | undefined;

  useEffect(() => {
    if (!provider) return;

    const configs: Record<AnalyticsProvider, AnalyticsConfig> = {
      plausible: {
        provider: "plausible",
        src:
          process.env.NEXT_PUBLIC_ANALYTICS_SRC ||
          "https://plausible.io/js/script.js",
        dataDomain: process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN,
      },
      umami: {
        provider: "umami",
        src:
          process.env.NEXT_PUBLIC_ANALYTICS_SRC ||
          "https://cloud.umami.is/script.js",
        siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID,
      },
      google: {
        provider: "google",
        src:
          process.env.NEXT_PUBLIC_ANALYTICS_SRC ||
          `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_ANALYTICS_MEASUREMENT_ID}`,
        measurementId: process.env.NEXT_PUBLIC_ANALYTICS_MEASUREMENT_ID,
      },
      custom: {
        provider: "custom",
        src: process.env.NEXT_PUBLIC_ANALYTICS_SRC || "",
      },
    };

    const config = configs[provider];
    if (!config || !config.src) return;

    // Inject the analytics script
    const script = document.createElement("script");
    script.src = config.src;
    script.async = true;
    script.defer = true;

    if (config.dataDomain) {
      script.setAttribute("data-domain", config.dataDomain);
    }
    if (config.siteId) {
      script.setAttribute("data-site-id", config.siteId);
    }

    document.head.appendChild(script);

    // Google Analytics 4 needs additional initialization
    if (provider === "google" && config.measurementId) {
      const w = window as unknown as { dataLayer: unknown[] };
      w.dataLayer = w.dataLayer || [];
      function gtag(...args: unknown[]) {
        w.dataLayer.push(args);
      }
      gtag("js", new Date());
      gtag("config", config.measurementId);
    }
  }, [provider]);

  // Component renders nothing — it only injects scripts
  return null;
}