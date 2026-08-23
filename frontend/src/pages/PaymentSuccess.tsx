import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, []);
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center
   px-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm text-center space-y-4">
        <BiCheckCircle size={64} className="mx-auto text-green-500" />

        <h1 className="text-2xl font-bold text-gray-800">Payment Successful</h1>

        <p className="text-sm text-gray-500">
          Your order has been placed successfully 🎉
        </p>

        {paymentId && (
          <div className="rounded-lg bg-gray-50">
            <span className="text-gray-500">PaymentID: </span>
            <p className="font-mono break-all text-gray-500">{paymentId}</p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white"
            onClick={() => navigate("/")}
          >
            Order More <BsArrowRight size={16} />
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white"
            onClick={() => navigate("/orders")}
          >
            Your orders <BsArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
