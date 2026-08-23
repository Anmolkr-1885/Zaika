import { Request, Response } from "express";
import axios from "axios";
import { razorpay } from "../config/razorpay.js";
import { verifyRazorpaySignature } from "../config/verifyRazorpay.js";
import { publishPaymentSuccess } from "../config/payment.producer.js";

export const createRazorpayOrder = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("=================================");
    console.log("🔥 RAZORPAY CREATE ORDER START");
    console.log("=================================");

    const { orderId } = req.body;

    console.log("1️⃣ Order ID:", orderId);

    console.log(
      "2️⃣ RESTAURANT_SERVICE:",
      process.env.RESTAURANT_SERVICE
    );

    console.log(
      "3️⃣ INTERNAL_SERVICE_KEY:",
      process.env.INTERNAL_SERVICE_KEY
        ? "EXISTS"
        : "MISSING"
    );

    console.log(
      "4️⃣ RAZORPAY_KEY_ID:",
      process.env.RAZORPAY_KEY_ID
    );

    console.log(
      "5️⃣ RAZORPAY_KEY_SECRET:",
      process.env.RAZORPAY_KEY_SECRET
        ? "EXISTS"
        : "MISSING"
    );

    if (!orderId) {
      console.log("❌ ORDER ID MISSING");

      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const url = `${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`;

    console.log("6️⃣ RESTAURANT PAYMENT URL:", url);

    const response = await axios.get(url, {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    });

    console.log("7️⃣ RESTAURANT RESPONSE:", response.data);

    const data = response.data;

    console.log("8️⃣ ORDER ID:", data.orderId);
    console.log("9️⃣ AMOUNT:", data.amount);
    console.log("🔟 CURRENCY:", data.currency);

    if (!data.amount) {
      console.log("❌ AMOUNT MISSING");

      return res.status(400).json({
        success: false,
        message: "Order amount not found",
      });
    }

    const razorpayAmount = data.amount * 100;

    console.log("💰 AMOUNT IN RUPEES:", data.amount);
    console.log("💰 AMOUNT IN PAISE:", razorpayAmount);

    console.log("🧾 RAZORPAY RECEIPT:", orderId);

    console.log("🚀 BEFORE RAZORPAY CREATE");

    const razorpayOrder = await razorpay.orders.create({
      amount: razorpayAmount,
      currency: "INR",
      receipt: orderId,
    });

    console.log("=================================");
    console.log("✅ RAZORPAY ORDER CREATED");
    console.log("🆔 RAZORPAY ORDER ID:", razorpayOrder.id);
    console.log("💰 RAZORPAY AMOUNT:", razorpayOrder.amount);
    console.log("💱 RAZORPAY CURRENCY:", razorpayOrder.currency);
    console.log("🧾 RAZORPAY RECEIPT:", razorpayOrder.receipt);
    console.log("📌 RAZORPAY STATUS:", razorpayOrder.status);
    console.log("=================================");

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.log("\n=================================");
    console.log("❌❌❌ RAZORPAY PAYMENT CREATE ERROR ❌❌❌");
    console.log("=================================");

    console.log("🔥 ERROR MESSAGE:", error?.message);
    console.log("🔥 ERROR CODE:", error?.code);
    console.log("🔥 ERROR STATUS:", error?.status);
    console.log("🔥 ERROR DESCRIPTION:", error?.description);
    console.log("🔥 ERROR REASON:", error?.reason);
    console.log("🔥 ERROR FIELD:", error?.field);

    console.log(
      "🔥 ERROR RESPONSE:",
      error?.response?.data
    );

    console.log("🔥 ERROR STACK:", error?.stack);

    console.log("=================================\n");

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        error?.description ||
        "Razorpay order creation failed",

      error: {
        code: error?.code,
        description: error?.description,
        reason: error?.reason,
        field: error?.field,
      },
    });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return res.status(400).json({
      message: "Payment verification failed",
    });
  }

  await publishPaymentSuccess({
    orderId,
    paymentId: razorpay_payment_id,
    provider: "razorpay",
  });

  res.json({
    message: "Payment verified successfully",
  });
};

import dotenv from "dotenv";

dotenv.config();

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const payWithStripe = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

  

    const { data } = await axios.get(
      `${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Zaika food order",
            },
            unit_amount: data.amount * 100,
          },
          quantity: 1,
        },
      ],

      metadata: {
        orderId,
      },

      success_url: `${process.env.FRONTEND_URL}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    

    res.json({
      url: session.url,
    });
  } catch (error: any) {
    console.error("❌ STRIPE PAYMENT CREATE ERROR");
    console.error("Message:", error?.message);
    console.error("Response:", error?.response?.data);
    console.error("Stack:", error?.stack);

    res.status(500).json({
      message: "stripe payment failed",
    });
  }
};
export const verifyStripe = async (req: Request, res: Response) => {
  const { sessionId } = req.body;
console.log("request is comin in verifyStripe");  
  

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(session);

    if (!session) {
      return res.status(400).json({
        message: "Payment verifcation failed",
      });
    }

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return res.status(400).json({
        message: "orderid not found in stripe session",
      });
    }

    await publishPaymentSuccess({
      orderId,
      paymentId: sessionId,
      provider: "stripe",
    });

    res.json({
      message: "payment verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "stripe payment failed",
    });
  }
};


