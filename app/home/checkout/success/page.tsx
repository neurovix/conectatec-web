import { Suspense } from "react";
import SuccessPageContent from "./SuccessPageContent";
import SuccessLoadingFallback from "./SuccessLoadingFallback";

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoadingFallback />}>
      <SuccessPageContent />
    </Suspense>
  );
}
