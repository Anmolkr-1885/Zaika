import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use("/api/v1", adminRoutes);

app.use("/health",(req,res)=>{
  res.json({message:"ADMIN is up and running"})
})

app.listen(process.env.PORT, () => {
  console.log(`Admin Service is running on port ${process.env.PORT}`);
});
