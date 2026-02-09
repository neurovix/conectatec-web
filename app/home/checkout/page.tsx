import { Suspense } from "react";
import CheckoutPageContent from "./CheckoutPageContent";
import CheckoutLoadingFallback from "./CheckoutLoadingFallback";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoadingFallback />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
