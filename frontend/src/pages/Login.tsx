
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import {
  FiPlay,
  FiArrowRight,
  FiMapPin,
  FiClock,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  // ================= GOOGLE LOGIN =================

  const responseGoogle = async (authResult: any) => {
    setLoading(true);

    try {
      const result = await axios.post(
        `${authService}/api/auth/login`,
        {
          code: authResult["code"],
        }
      );

      localStorage.setItem("token", result.data.token);

      toast.success(result.data.message);

      setUser(result.data.user);
      setIsAuth(true);

      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="min-h-screen overflow-hidden bg-[#fff8fa] text-gray-900">

      {/* ================= HERO SECTION ================= */}

      <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 lg:px-8">

        <div className="grid w-full items-center gap-14 lg:grid-cols-2">

          {/* ================= LEFT SIDE ================= */}

          <section className="relative">

            {/* Decorative background */}

            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />

            <div className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="relative">

              <h1 className="max-w-xl text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 md:text-6xl">

                Good food.

                <br />

                <span className="text-[#E23774]">
                  Great moments.
                </span>

              </h1>

              {/* Description */}

              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-500">

                Discover your favorite restaurants, order delicious meals,
                and track your delivery in real time — all from one seamless
                platform.

              </p>

              {/* ================= CTA BUTTONS ================= */}

              <div className="mt-8 flex flex-wrap gap-4">

                {/* Get Started */}

                <button
                  onClick={googleLogin}
                  disabled={loading}
                  className="group flex items-center gap-3 rounded-xl bg-[#E23774] px-6 py-3.5 font-semibold text-white shadow-lg shadow-pink-200 transition duration-200 hover:-translate-y-0.5 hover:bg-[#d72d68] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <FcGoogle
                    size={20}
                    className="rounded-full bg-white p-0.5"
                  />

                  {loading ? "Signing in..." : "Get Started"}

                  <FiArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />

                </button>

                {/* See Demo */}

                <button
                  onClick={() =>
                    window.open("https://www.google.com", "_blank")
                  }
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#E23774] hover:text-[#E23774]"
                >

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 text-[#E23774]">

                    <FiPlay
                      size={13}
                      fill="currentColor"
                    />

                  </span>

                  See Product Demo

                </button>

              </div>

              {/* ================= FEATURES ================= */}

              <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-gray-200 pt-7">

                {/* Local Restaurants */}

                <div>

                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-[#E23774]">

                    <FiMapPin size={17} />

                  </div>

                  <p className="text-sm font-semibold text-gray-800">
                    Local Restaurants
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Discover nearby
                  </p>

                </div>

                {/* Fast Delivery */}

                <div>

                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">

                    <FiClock size={17} />

                  </div>

                  <p className="text-sm font-semibold text-gray-800">
                    Fast Delivery
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Real-time tracking
                  </p>

                </div>

                {/* Secure Orders */}

                <div>

                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-500">

                    <FiShield size={17} />

                  </div>

                  <p className="text-sm font-semibold text-gray-800">
                    Secure Orders
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Safe checkout
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ================= LOGIN CARD ================= */}

          <section className="flex justify-center lg:justify-end">

            <div className="w-full max-w-md">

              {/* Food Icon */}

              <div className="relative mb-[-35px] flex justify-center">

                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white text-6xl shadow-xl">

                  🍕

                </div>

                <div className="absolute left-[25%] top-4 h-3 w-3 rounded-full bg-[#E23774]" />

                <div className="absolute right-[25%] top-8 h-2 w-2 rounded-full bg-orange-400" />

              </div>

              {/* Login Card */}

              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-10">

                {/* Header */}

                <div className="pt-5 text-center">

                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E23774] text-xl font-bold text-white shadow-md">
                    Z
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome to Zaika
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Sign in to discover restaurants and order your
                    favorite meals.
                  </p>

                </div>

                {/* Google Login */}

                <button
                  onClick={googleLogin}
                  disabled={loading}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <FcGoogle size={21} />

                  {loading
                    ? "Signing in..."
                    : "Continue with Google"}

                </button>

                {/* Divider */}

                <div className="my-6 flex items-center gap-3">

                  <div className="h-px flex-1 bg-gray-100" />

                  <span className="text-xs text-gray-400">
                    Secure authentication
                  </span>

                  <div className="h-px flex-1 bg-gray-100" />

                </div>

                {/* Benefits */}

                <div className="space-y-3">

                  {/* Benefit 1 */}

                  <div className="flex items-center gap-3 text-sm text-gray-600">

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-500">

                      <FiCheck size={13} />

                    </span>

                    Browse restaurants and menus

                  </div>

                  {/* Benefit 2 */}

                  <div className="flex items-center gap-3 text-sm text-gray-600">

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-500">

                      <FiCheck size={13} />

                    </span>

                    Manage your cart and orders

                  </div>

                  {/* Benefit 3 */}

                  <div className="flex items-center gap-3 text-sm text-gray-600">

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-500">

                      <FiCheck size={13} />

                    </span>

                    Track deliveries in real time

                  </div>

                </div>

                {/* Terms */}

                <p className="mt-7 text-center text-xs leading-5 text-gray-400">

                  By continuing, you agree to our{" "}

                  <span className="cursor-pointer text-[#E23774]">
                    Terms of Service
                  </span>{" "}

                  and{" "}

                  <span className="cursor-pointer text-[#E23774]">
                    Privacy Policy
                  </span>

                  .

                </p>

              </div>

              {/* Recruiter Text */}

              <p className="mt-5 text-center text-xs text-gray-400">
                Built as a full-stack food delivery platform
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default Login;
