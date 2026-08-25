import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  getMyOrders,
  fetchSingleOrder,
  updateOrderStatus,
  assignRiderToOrder,
  getCurrentOrderForRider,
  updateOrderStatusRider
} from "../controllers/order.js"

const router = express.Router();

router.get("/myorder", isAuth, getMyOrders);
router.get("/:id", isAuth, fetchSingleOrder);
router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get(
  "/restaurant/:restaurantId",
  isAuth,
  isSeller,
  fetchRestaurantOrders
);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);
router.put("/assign/rider", assignRiderToOrder);
router.get("/current/rider", getCurrentOrderForRider);
router.put("/update/status/rider", updateOrderStatusRider);



export default router;
