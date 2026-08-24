import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import restaurantRoutes from "./routes/restaurant.js";
import cors from "cors";
import itemRoutes from "./routes/menuitem.js";
import cartRoutes from "./routes/cart.js"
import addressRoutes from "./routes/address.js"
import orderRoutes from "./routes/order.js"
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";
import morgan from "morgan";
dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 5001;
await connectRabbitMQ();
startPaymentConsumer();

app.use("/api/restaurant", restaurantRoutes)
app.use("/api/item",itemRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);


app.listen(PORT, () => {
  console.log(`Restaurant service is running on port ${PORT}`);
    connectDB();
});