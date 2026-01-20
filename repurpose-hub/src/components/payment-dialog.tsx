import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { requestUrl } from "@/lib/requestUrl";
import { getCookie } from "@/lib/getUser";
import { useNavigate } from "react-router-dom";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export function PaymentDialog({ isOpen, onClose, total }: PaymentDialogProps) {
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const user = getCookie();
  const navigate = useNavigate();

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
  }, [showSuccessDialog, countdown]);

  const handleNavigation = () => {
    setShowSuccessDialog(false);
    setIsPaymentSuccessful(false);
    onClose();
    navigate("/home");
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const completePayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    checkoutId: string,
  ) => {
    try {
      // Verify payment with backend
      const verificationResponse = await requestUrl({
        method: "POST",
        endpoint: "payment/verify-payment",
        data: {
          orderId: razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId,
          razorpaySignature: razorpaySignature,
        },
      });

      console.log(verificationResponse, checkoutId);

      if (verificationResponse.data.success && checkoutId) {
        // Complete the checkout process
        await requestUrl({
          method: "POST",
          endpoint: "cart/complete-checkout",
          data: {
            order_id: checkoutId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
          },
        });

        // Show success state and start countdown
        setIsPaymentSuccessful(true);
        setShowSuccessDialog(true);
        setCountdown(5);
      } else {
        alert("Payment verification failed! Please contact support.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment completion error:", error);
      alert("Payment completion failed. Please contact support.");
      setIsProcessing(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Load Razorpay script first
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // First, create checkout record
      const checkoutResponse = await requestUrl({
        method: "POST",
        endpoint: "cart/checkout",
        data: {
          user_id: user.id,
          total_payment: total,
        },
      });

      const newCheckoutId = checkoutResponse.data.checkout_id;

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

      // Razorpay checkout options
      const options = {
        key: "rzp_test_RZmsXRdoSG9Eu4", // Your Razorpay test key
        amount: Math.round(total * 100), // Convert to paise
        currency: "INR",
        name: "RepurposeHub",
        description: "Eco-friendly Products Purchase",
        order_id: razorpayOrderId,
        handler: function (response: any) {
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
        notes: {
          user_id: user.id,
          checkout_id: newCheckoutId,
        },
        theme: {
          color: "#10B981", // Green theme for eco-friendly brand
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            console.log("Payment modal dismissed");
          },
        },
      };

      // Initialize Razorpay
      const rzp1 = new (window as any).Razorpay(options);

      // Handle payment failures
      rzp1.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      // Open Razorpay checkout
      rzp1.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      alert("Payment initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsPaymentSuccessful(false);
    setIsProcessing(false);
    setShowSuccessDialog(false);
    setCountdown(5);
    onClose();
  };

  const handleManualNavigation = () => {
    handleNavigation();
  };

  return (
    <>
      {/* Main Payment Dialog */}
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
              <p className="text-lg font-semibold">
                Your payment was successful!
              </p>
              <p className="text-sm text-gray-500">
                Thank you for your purchase.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Preparing your order...
              </p>
            </div>
          ) : (
            <form
              onSubmit={handlePayment}
              className="flex items-center justify-center flex-col space-y-6"
            >
              <div className="text-center">
                <h1 className="p-8 font-bold text-center text-3xl tracking-tighter">
                  Pay now!
                </h1>
                <p className="text-lg text-gray-600">
                  Total Amount:{" "}
                  <span className="font-semibold">Rs.{total?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You will be redirected to Razorpay for secure payment
                </p>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay Rs.${total?.toFixed(2)}`
                )}
              </Button>

              {isProcessing && (
                <p className="text-sm text-gray-500 text-center">
                  Preparing payment gateway...
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

      {/* Success Confirmation Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              Order Confirmed!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <p className="text-xl font-semibold text-center mb-2">
              Thank You for Your Purchase!
            </p>
            <p className="text-gray-600 text-center mb-4">
              Your order has been successfully placed and payment has been
              processed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 w-full">
              <p className="text-sm text-green-800 text-center">
                You will be automatically redirected to the home page in{" "}
                <span className="font-bold">{countdown}</span> second
                {countdown !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={handleManualNavigation}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Home Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
