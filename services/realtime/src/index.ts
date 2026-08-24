import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { initSocket } from "./socket.js";
import internalRoute from "./routes/internal.js";
import morgan from "morgan";

dotenv.config();
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/v1/internal", internalRoute);

const server = http.createServer(app);

initSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`Realtime service is running port ${process.env.PORT}`);
});
