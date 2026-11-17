"use client";

declare global {
  interface Window {
    Cashfree?: any;
  }
}

let cashfreeSdkPromise: Promise<any> | null = null;

/**
 * Dynamically loads the official Cashfree JS SDK v3
 */
export function loadCashfree(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree);
  }

  if (!cashfreeSdkPromise) {
    cashfreeSdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("cashfree-js-sdk");
      if (existingScript) {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          existingScript.addEventListener("load", () => resolve(window.Cashfree));
          existingScript.addEventListener("error", (e) => reject(e));
        }
        return;
      }

      const script = document.createElement("script");
      script.id = "cashfree-js-sdk";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        resolve(window.Cashfree);
      };
      script.onerror = () => {
        cashfreeSdkPromise = null;
        reject(new Error("Failed to load Cashfree Payment Gateway SDK. Please check your network connection."));
      };
      document.head.appendChild(script);
    });
  }

  return cashfreeSdkPromise;
}

export interface CheckoutOptions {
  paymentSessionId: string;
  mode?: "production" | "sandbox";
  redirectTarget?: "_self" | "_modal" | "_top";
}

/**
 * Launches Cashfree Checkout with the provided paymentSessionId
 */
export async function initiateCashfreePayment({
  paymentSessionId,
  mode = "production",
  redirectTarget = "_self"
}: CheckoutOptions) {
  const Cashfree = await loadCashfree();
  if (!Cashfree) {
    throw new Error("Unable to initialize Cashfree Payment Gateway.");
  }

  const cashfreeInstance = Cashfree({
    mode: mode
  });

  return cashfreeInstance.checkout({
    paymentSessionId,
    redirectTarget
  });
}
