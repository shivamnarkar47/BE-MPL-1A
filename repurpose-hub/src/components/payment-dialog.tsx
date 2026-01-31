import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { requestUrl } from "@/lib/requestUrl";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type PaymentErrorType = "none" | "network" | "validation" | "razorpay" | "server" | "cancelled";

interface RazorpayWindow extends Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  email: string;
  phone?: string;
  name?: string;
}

interface PendingCheckout {
  checkoutId: string;
  idempotencyKey: string;
  total: number;
  createdAt: number;
}

export function PaymentDialog({ isOpen, onClose, total }: PaymentDialogProps) {
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [errorType, setErrorType] = useState<PaymentErrorType>("none");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generate idempotency key
  const generateIdempotencyKey = useCallback(() => {
    return `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, [user?.id]);

  // Check for pending checkout on mount
  useEffect(() => {
    if (isOpen) {
      const pending = sessionStorage.getItem("pendingCheckout");
      if (pending) {
        try {
          const parsed: PendingCheckout = JSON.parse(pending);
          // Check if less than 30 minutes old
          if (Date.now() - parsed.createdAt < 30 * 60 * 1000) {
            const proceed = window.confirm(
              "You have a pending payment. Would you like to continue where you left off?"
            );
            if (proceed) {
              setIsProcessing(true);
              handleContinuePayment(parsed);
            } else {
              sessionStorage.removeItem("pendingCheckout");
            }
          } else {
            sessionStorage.removeItem("pendingCheckout");
          }
        } catch {
          sessionStorage.removeItem("pendingCheckout");
        }
      }
    }
  }, [isOpen, handleContinuePayment]);

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if ((window as RazorpayWindow).Razorpay) {
        resolve(true);
        return;
      }
      setScriptLoading(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setScriptLoaded(true);
        setScriptLoading(false);
        resolve(true);
      };
      script.onerror = () => {
        setScriptLoading(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (isOpen && !scriptLoaded && !scriptLoading) {
      loadRazorpayScript();
    }
  }, [isOpen, scriptLoaded, scriptLoading, loadRazorpayScript]);

  // Countdown timer for success dialog
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showSuccessDialog && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showSuccessDialog && countdown === 0) {
      handleNavigation();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessDialog, countdown, handleNavigation]);

  const handleNavigation = useCallback(() => {
    setShowSuccessDialog(false);
    setIsPaymentSuccessful(false);
    onClose();
    sessionStorage.removeItem("pendingCheckout");
    navigate("/home");
  }, [onClose, navigate]);

  const handleContinuePayment = useCallback(async (pending: PendingCheckout) => {
    if (!scriptLoaded && !scriptLoading) {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setErrorType("server");
        setErrorMessage("Failed to load payment gateway. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }
    }

    try {
      // Resume Razorpay order creation
      const orderResponse = await requestUrl({
        method: "POST",
        endpoint: "payment/create-order",
        data: {
          amount: pending.total,
          currency: "INR",
          user_id: user.id,
        },
      });

      const razorpayOrderId = orderResponse.data.orderId;

      const options: RazorpayOptions = {
        key: "rzp_test_RZmsXRdoSG9Eu4",
        amount: Math.round(pending.total * 100),
        currency: "INR",
        name: "RepurposeHub",
        description: "Eco-friendly Products Purchase",
        order_id: razorpayOrderId,
        handler: function (response: RazorpayResponse) {
          completePayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            pending.checkoutId,
          );
        },
        prefill: {
          name: user.full_name || "Customer",
          email: user.email || "customer@example.com",
          contact: user.phone || "+919876543210",
        },
        theme: {
          color: "#10B981",
        },
      };

      const rzp1 = new (window as RazorpayWindow).Razorpay(options);
      rzp1.on("payment.failed", function (response: { error: { description: string } }) {
        setErrorType("razorpay");
        setErrorMessage(response.error.description || "Payment failed. Please try again.");
        setIsProcessing(false);
      });
      rzp1.open();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
        : "Payment initialization failed. Please try again.";
      setErrorType("server");
      setErrorMessage(errorMessage);
      setIsProcessing(false);
    }
  }, [scriptLoaded, scriptLoading, loadRazorpayScript, user]);

  const completePayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    checkoutId: string,
  ) => {
    try {
      setErrorType("none");
      const verificationResponse = await requestUrl({
        method: "POST",
        endpoint: "payment/verify-payment",
        data: {
          orderId: razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId,
          razorpaySignature: razorpaySignature,
        },
      });

      if (verificationResponse.data.success && checkoutId) {
        await requestUrl({
          method: "POST",
          endpoint: "cart/complete-checkout",
          data: {
            order_id: checkoutId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
          },
        });

        sessionStorage.removeItem("pendingCheckout");
        setIsPaymentSuccessful(true);
        setShowSuccessDialog(true);
        setCountdown(5);
        setErrorType("none");
      } else {
        setErrorType("server");
        setErrorMessage("Payment verification failed. Please contact support.");
        setIsProcessing(false);
      }
    } catch (error: unknown) {
      console.error("Payment completion error:", error);
      setErrorType("server");
      setErrorMessage("Payment completion failed. Please contact support.");
      setIsProcessing(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorType("none");
    setErrorMessage("");
    setRetryCount(prev => prev + 1);

    if (!scriptLoaded && !scriptLoading) {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setErrorType("server");
        setErrorMessage("Failed to load payment gateway. Please check your connection.");
        return;
      }
    }

    if (scriptLoading) {
      setErrorType("server");
      setErrorMessage("Please wait, payment gateway is still initializing...");
      return;
    }

    if (!user?.id) {
      setErrorType("server");
      setErrorMessage("Please log in to continue.");
      return;
    }

    setIsProcessing(true);
    const idempotencyKey = generateIdempotencyKey();

    try {
      // Create checkout with idempotency
      const checkoutResponse = await requestUrl({
        method: "POST",
        endpoint: "cart/checkout",
        data: {
          user_id: user.id,
          total_payment: total,
          idempotency_key: idempotencyKey,
        },
      });

      if (checkoutResponse.data.error === "validation_error") {
        setErrorType("validation");
        setErrorMessage(checkoutResponse.data.message);
        setCalculatedTotal(checkoutResponse.data.calculated_total);
        setIsProcessing(false);
        return;
      }

      const newCheckoutId = checkoutResponse.data.checkout_id;

      // Store pending checkout for recovery
      const pendingCheckout: PendingCheckout = {
        checkoutId: newCheckoutId,
        idempotencyKey,
        total,
        createdAt: Date.now(),
      };
      sessionStorage.setItem("pendingCheckout", JSON.stringify(pendingCheckout));

      // Create Razorpay order
      const orderResponse = await requestUrl({
        method: "POST",
        endpoint: "payment/create-order",
        data: {
          amount: total,
          currency: "INR",
          user_id: user.id,
        },
      });

      const razorpayOrderId = orderResponse.data.orderId;

      const options: RazorpayOptions = {
        key: "rzp_test_RZmsXRdoSG9Eu4",
        amount: Math.round(total * 100),
        currency: "INR",
        name: "RepurposeHub",
        description: "Eco-friendly Products Purchase",
        order_id: razorpayOrderId,
        handler: function (response: RazorpayResponse) {
          completePayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            newCheckoutId,
          );
        },
        prefill: {
          name: user.full_name || "Customer",
          email: user.email || "customer@example.com",
          contact: user.phone || "+919876543210",
        },
        theme: {
          color: "#10B981",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp1 = new (window as RazorpayWindow).Razorpay(options);

      rzp1.on("payment.failed", function (response: { error: { description: string } }) {
        setErrorType("razorpay");
        setErrorMessage(response.error.description || "Payment failed. Please try again.");
        setIsProcessing(false);
      });

      rzp1.open();
    } catch (error: unknown) {
      console.error("Payment initialization error:", error);
      
      const axiosError = error as { code?: string; response?: { status?: number; data?: { detail?: string } } };
      if (axiosError?.code === "ECONNABORTED" || !axiosError?.response) {
        setErrorType("network");
        setErrorMessage("Network error. Please check your connection and try again.");
      } else if (axiosError?.response?.status === 400) {
        setErrorType("validation");
        setErrorMessage(axiosError.response?.data?.detail || "Invalid payment request.");
      } else if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
        setErrorType("server");
        setErrorMessage("Session expired. Please log in again.");
      } else {
        setErrorType("server");
        setErrorMessage(axiosError?.response?.data?.detail || "Payment initialization failed. Please try again.");
      }
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsPaymentSuccessful(false);
    setIsProcessing(false);
    setShowSuccessDialog(false);
    setCountdown(5);
    setErrorType("none");
    setErrorMessage("");
    setCalculatedTotal(null);
    onClose();
  };

  const handleManualNavigation = () => {
    handleNavigation();
  };

  const handleRetry = () => {
    setErrorType("none");
    setErrorMessage("");
    setCalculatedTotal(null);
  };

  const handleCancelOrder = () => {
    sessionStorage.removeItem("pendingCheckout");
    handleClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isPaymentSuccessful ? "Payment Successful" : "Payment Details"}
            </DialogTitle>
          </DialogHeader>
          
          {isPaymentSuccessful ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-semibold">Your payment was successful!</p>
              <p className="text-sm text-gray-500">Thank you for your purchase.</p>
              <p className="text-xs text-gray-400 mt-2">Preparing your order...</p>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="flex items-center justify-center flex-col space-y-6">
              <div className="text-center">
                <h1 className="p-8 font-bold text-center text-3xl tracking-tighter">Pay now!</h1>
                <p className="text-lg text-gray-600">
                  Total Amount: <span className="font-semibold">Rs.{total?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You will be redirected to Razorpay for secure payment
                </p>
              </div>

              {/* Error Display */}
              {errorType !== "none" && (
                <div className="w-full p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        {errorType === "network" && "Connection Error"}
                        {errorType === "validation" && "Amount Mismatch"}
                        {errorType === "razorpay" && "Payment Failed"}
                        {errorType === "server" && "Server Error"}
                        {errorType === "cancelled" && "Payment Cancelled"}
                      </p>
                      <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                      
                      {errorType === "validation" && calculatedTotal && (
                        <p className="text-sm text-red-600 mt-1">
                          Calculated total: Rs.{calculatedTotal.toFixed(2)}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleRetry}
                          className="text-red-700 border-red-300 hover:bg-red-100"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                        {(errorType === "validation" || errorType === "server") && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelOrder}
                            className="text-red-600 hover:bg-red-100"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isProcessing || scriptLoading}
                className="min-w-[120px]"
              >
                {isProcessing || scriptLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {scriptLoading ? "Loading..." : "Processing..."}
                  </>
                ) : (
                  `Pay Rs.${total?.toFixed(2)}`
                )}
              </Button>

              {scriptLoading && (
                <p className="text-sm text-gray-500 text-center">
                  Initializing payment gateway...
                </p>
              )}

              <div className="text-xs text-gray-400 text-center max-w-[300px]">
                <p>Secure payment powered by Razorpay</p>
                <p className="mt-1">Test Card: 4111 1111 1111 1111</p>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              Order Confirmed!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <p className="text-xl font-semibold text-center mb-2">Thank You for Your Purchase!</p>
            <p className="text-gray-600 text-center mb-4">
              Your order has been successfully placed and payment has been processed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 w-full">
              <p className="text-sm text-green-800 text-center">
                You will be automatically redirected to the home page in{" "}
                <span className="font-bold">{countdown}</span> second
                {countdown !== 1 ? "s" : ""}
              </p>
            </div>
            <Button onClick={handleManualNavigation} className="w-full bg-green-600 hover:bg-green-700">
              Go to Home Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
