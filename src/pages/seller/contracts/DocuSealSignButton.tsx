
import { useEffect, useRef, useState } from "react";
import { FileSignature, Loader2 } from "lucide-react";

import { useLazyGetContractSignUrlQuery } from "../../../services/contractService";

type DocuSealSignButtonProps = {
  contractId: string;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
  className?: string;
  onError?: (message: string) => void;
  onSigningOpened?: () => void;
  onReturnFromSigning?: () => void | Promise<void>;
};

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
}

function openSigningWindow(url: string) {
  const signingWindow = window.open(url, "_blank");

  if (signingWindow) {
    signingWindow.opener = null;
  }

  return Boolean(signingWindow);
}

function DocuSealSignButton({
  contractId,
  label = "Sign Contract",
  loadingLabel = "Opening DocuSeal...",
  disabled = false,
  className = "",
  onError,
  onSigningOpened,
  onReturnFromSigning,
}: DocuSealSignButtonProps) {
  const [getContractSignUrl, { isFetching }] =
    useLazyGetContractSignUrlQuery();

  const [isWaitingForReturn, setIsWaitingForReturn] = useState(false);
  const openedSigningRef = useRef(false);

  useEffect(() => {
    function handleWindowFocus() {
      if (!openedSigningRef.current) return;

      openedSigningRef.current = false;
      setIsWaitingForReturn(false);

      window.setTimeout(() => {
        onReturnFromSigning?.();
      }, 1000);
    }

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [onReturnFromSigning]);

  async function handleOpenDocuSeal() {
    if (!contractId || disabled || isFetching || isWaitingForReturn) return;

    try {
      onError?.("");

      const response = await getContractSignUrl(contractId).unwrap();

      if (!response?.embed_src) {
        throw new Error("Signing URL was not returned by backend.");
      }

      const opened = openSigningWindow(response.embed_src);

      if (!opened) {
        throw new Error(
          "Popup was blocked. Please allow popups and try again."
        );
      }

      openedSigningRef.current = true;
      setIsWaitingForReturn(true);
      onSigningOpened?.();
    } catch (error: any) {
      openedSigningRef.current = false;
      setIsWaitingForReturn(false);

      onError?.(
        getErrorMessage(
          error,
          "Unable to open DocuSeal signing screen. Please try again."
        )
      );
    }
  }

  const isBusy = isFetching || isWaitingForReturn;

  return (
    <button
      type="button"
      onClick={handleOpenDocuSeal}
      disabled={!contractId || disabled || isBusy}
      className={
        className ||
        "inline-flex items-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-card)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {isBusy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSignature className="h-4 w-4" />
      )}

      {isFetching
        ? loadingLabel
        : isWaitingForReturn
          ? "Waiting For Return"
          : label}
    </button>
  );
}

export default DocuSealSignButton;
