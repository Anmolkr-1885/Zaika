import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestaurant, fetchMyRestaurant, updateStatusRestaurant, updateRestaurant , getNearbyRestaurant, fetchSingleRestaurant} from "../controllers/restaurants.js";
import uploadFile from "../middlewares/multer.js";

const router= express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);
router.get('/my', isAuth, isSeller, fetchMyRestaurant);
router.put("/status", isAuth, isSeller, updateStatusRestaurant);
router.put("/edit", isAuth, isSeller, updateRestaurant);
router.get("/all", isAuth, getNearbyRestaurant);
router.get("/:id", isAuth, fetchSingleRestaurant);
export default router;