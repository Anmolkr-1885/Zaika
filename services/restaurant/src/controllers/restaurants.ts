import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import Trycatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import jwt from "jsonwebtoken";

export const addRestaurant = Trycatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if(!user) {
        return res.status(401).json({
            message: "Unauthorized - User not found",
        });
    }

    const existingRestaurant = await Restaurant.findOne({
        ownerId: user._id,
    }); 

    if(existingRestaurant) {
        return res.status(400).json({
            message: "You already have a restaurant.",
        });
    }
    
    const { name, description, latitude, longitude, formatedAddress, phone } = req.body;

    if(!name || !latitude || !longitude) {
        return res.status(400).json({
            message: "All fields are required.",
        });
    }

    const file=req.file;

    if(!file) {
        return res.status(400).json({
            message: "Restaurant image is required.",
        });
    }

    const fileBuffer = getBuffer(file);

    if(!fileBuffer?.content) {
        return res.status(500).json({
            message: "Failed to process the file Buffer.",
        });
    }

    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE_URL}/api/upload`, {
        buffer: fileBuffer.content,
    });

    const restaurant = await Restaurant.create({
        name,
        description,
        phone,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formatedAddress,
        },
        image: uploadResult.url,
        ownerId: user._id,
        isVerified: false
    });

    return res.status(201).json({
        message: "Restaurant added successfully.",
        restaurant,
    })

});

export const fetchMyRestaurant = Trycatch(async (req: AuthenticatedRequest, res) => {

    if(!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }

    const restaurant = await Restaurant.findOne({
        ownerId: req.user._id,
    });

    if(!restaurant) {
        return res.status(404).json({
            message: "No restaurant found for this user.",
        });
    }

    if(!req.user.restaurantId) {
        const token = jwt.sign(
            { 
                user: { 
                    ...req.user,
                    restaurantId: restaurant._id 
                }
            }, 
            process.env.JWT_SEC as string, 
            { 
                expiresIn: "15d" 
            }
        );
        return res.status(200).json(restaurant);
    }

    res.json( {restaurant} );
});

