
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import {
  FiArrowRight,
  FiClock,
  FiMapPin,
  FiPlay,
  FiShield,
  FiStar,
} from "react-icons/fi";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  // Demo video URL
  // You can also add this to your .env file:
  // VITE_DEMO_VIDEO_URL=https://www.youtube.com/watch?v=YOUR_VIDEO_ID
  const demoVideoUrl =
    import.meta.env.VITE_DEMO_VIDEO_URL ||
    "https://www.youtube.com/watch?v=YOUR_VIDEO_ID";

  const responseGoogle = async (authResult: any) => {
    setLoading(true);

    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

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

  const openDemo = () => {
    window.open(demoVideoUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#fff8fb] text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#E23774] via-[#e94d83] to-[#ff8a5c] lg:flex">

          {/* Decorative circles */}
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-white/10" />

          <div className="absolute right-20 top-20 h-20 w-20 rounded-full bg-white/10" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Brand + Hero */}
            <div>

              {/* Zaika Logo */}
              <div className="mb-10">
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  Zaika
                </span>
              </div>

              {/* Tagline */}
              <div className="max-w-xl">

                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
                  Food · Delivered · Better
                </p>

                <h1 className="text-5xl font-extrabold leading-tight text-white xl:text-6xl">
                  Your favourite
                  <br />
                  food,{" "}
                  <span className="text-yellow-200">
                    delivered.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">
                  Discover restaurants, order delicious meals and
                  track your delivery in real time — all from one
                  seamless platform.
                </p>

              </div>
            </div>

            {/* =================================================
                FEATURES
            ================================================= */}
            <div className="space-y-5">

              {/* Feature 1 */}
              <div className="flex items-center gap-4 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <FiMapPin size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Discover local restaurants
                  </p>

                  <p className="text-sm text-white/70">
                    Find your favourite food nearby
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-4 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <FiClock size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Real-time order tracking
                  </p>

                  <p className="text-sm text-white/70">
                    Know exactly where your order is
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-4 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <FiShield size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Secure & reliable
                  </p>

                  <p className="text-sm text-white/70">
                    Built with modern technology
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* =================================================
                MOBILE LOGO
            ================================================= */}
            <div className="mb-10 text-center lg:hidden">

              <h1 className="text-4xl font-extrabold tracking-tight text-[#E23774]">
                Zaika
              </h1>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Food · Delivered · Better
              </p>

            </div>

            {/* =================================================
                LOGIN CARD
            ================================================= */}
            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9">

              {/* Heading */}
              <div className="mb-8">

                <p className="mb-2 text-sm font-semibold text-[#E23774]">
                  WELCOME BACK 👋
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Log in to Zaika
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Sign in to discover great food and manage your
                  orders.
                </p>

              </div>

              {/* =================================================
                  GOOGLE LOGIN
              ================================================= */}
              <button
                onClick={googleLogin}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >

                <FcGoogle size={22} />

                <span>
                  {loading
                    ? "Signing in..."
                    : "Continue with Google"}
                </span>

                {!loading && (
                  <FiArrowRight
                    className="ml-auto transition-transform duration-200 group-hover:translate-x-1"
                    size={18}
                  />
                )}

              </button>

              {/* =================================================
                  DIVIDER
              ================================================= */}
              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-gray-100" />

                <span className="text-xs font-medium text-gray-400">
                  QUICK ACCESS
                </span>

                <div className="h-px flex-1 bg-gray-100" />

              </div>

              {/* =================================================
                  DEMO BUTTON
              ================================================= */}
              <button
                onClick={openDemo}
                className="group flex w-full items-center gap-4 rounded-xl bg-gradient-to-r from-[#E23774] to-[#f15b89] px-5 py-3.5 text-left text-white shadow-lg shadow-pink-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-200"
              >

                {/* Play Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">

                  <FiPlay
                    size={18}
                    fill="currentColor"
                    className="ml-0.5"
                  />

                </div>

                {/* Text */}
                <div className="flex-1">

                  <p className="font-bold">
                    Watch Project Demo
                  </p>

                  <p className="text-xs text-white/75">
                    See how Zaika works
                  </p>

                </div>

                {/* Arrow */}
                <FiArrowRight
                  size={19}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />

              </button>

              {/* =================================================
                  TRUST INDICATORS
              ================================================= */}
              <div className="mt-7 grid grid-cols-3 gap-3">

                {/* Easy */}
                <div className="rounded-xl bg-gray-50 p-3 text-center">

                  <FiStar
                    className="mx-auto mb-1 text-[#E23774]"
                    size={16}
                  />

                  <p className="text-[11px] font-semibold text-gray-600">
                    Easy to use
                  </p>

                </div>

                {/* Real Time */}
                <div className="rounded-xl bg-gray-50 p-3 text-center">

                  <FiClock
                    className="mx-auto mb-1 text-[#E23774]"
                    size={16}
                  />

                  <p className="text-[11px] font-semibold text-gray-600">
                    Real-time
                  </p>

                </div>

                {/* Secure */}
                <div className="rounded-xl bg-gray-50 p-3 text-center">

                  <FiShield
                    className="mx-auto mb-1 text-[#E23774]"
                    size={16}
                  />

                  <p className="text-[11px] font-semibold text-gray-600">
                    Secure
                  </p>

                </div>

              </div>

              {/* =================================================
                  TERMS
              ================================================= */}
              <p className="mt-7 text-center text-xs leading-5 text-gray-400">

                By continuing, you agree to our{" "}

                <span className="cursor-pointer font-medium text-[#E23774] hover:underline">
                  Terms of Service
                </span>{" "}

                and{" "}

                <span className="cursor-pointer font-medium text-[#E23774] hover:underline">
                  Privacy Policy
                </span>

                .

              </p>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}
            <p className="mt-6 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Zaika · Built with modern
              web technologies
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

