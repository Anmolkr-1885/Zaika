import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  createOrder,
  fetchOrderForPayment,
} from "../controllers/order.js";

const router = express.Router();


router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get(
  "/restaurant/:restaurantId",
  isAuth,
  isSeller,
  
);

export default router;
