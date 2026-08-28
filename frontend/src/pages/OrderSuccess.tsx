import axios from "axios";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";

const OrderSuccess = () => {
  const [params] = useSearchParams();

  const sessionId = params.get("session_id");

  console.log("🔥 COMPONENT RENDER");
  console.log("🔥 CURRENT URL:", window.location.href);
  console.log("🔥 SESSION ID:", sessionId);

  useEffect(() => {
    

    const verifyPayment = async () => {
      if (!sessionId) {
        console.log("❌ SESSION ID MISSING");
        return;
      }

      try {

     await axios.post(
          `${utilsService}/api/payment/stripe/verify`,
          {
            sessionId,
          }
        );


        toast.success("Payment successful 🎉");
      } catch (error: any) {
        console.error("❌ VERIFY ERROR:", error);
        console.error("❌ RESPONSE:", error?.response?.data);

        toast.error("Stripe verification failed");
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful 🎉
      </h1>
    </div>
  );
};

export default OrderSuccess;