import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { IMenuItem } from "../models/MenuItems.js";
import Order from "../models/Order.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.js";
import { publishEvent } from "../config/order.publisher.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {

  try {
    const user = req.user;

    if (!user) {
      console.log("❌ USER NOT FOUND");

      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    
    const { paymentMethod, addressId } = req.body;

    if (!addressId) {
      console.log("❌ ADDRESS ID MISSING");

      return res.status(400).json({
        message: "Address is required",
      });
    }


    const address = await Address.findOne({
      _id: addressId,
      userId: user._id,
    });

    console.log("📦 ADDRESS RESULT:", address);

    if (!address) {
      console.log("❌ ADDRESS NOT FOUND");

      return res.status(404).json({
        message: "Address Not found",
      });
    }

    const getDistanceKm = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      

      const R = 6371;

      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = +(R * c).toFixed(2);


      return distance;
    };

    // --------------------------------------------------
    // 5. FETCH CART
    // --------------------------------------------------
    console.log("🛒 FETCHING CART...");

    const cartItems = await Cart.find({
      userId: user._id,
    })
      .populate<{ itemId: IMenuItem }>("itemId")
      .populate<{ restaurantId: IRestaurant }>("restaurantId");

    console.log("🛒 CART COUNT:", cartItems.length);
    console.log(
      "🛒 CART DATA:",
      JSON.stringify(cartItems, null, 2)
    );

    if (cartItems.length === 0) {
      console.log("❌ CART IS EMPTY");

      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // --------------------------------------------------
    // 6. FIND INVALID CART ITEMS
    // --------------------------------------------------
    console.log("🔎 CHECKING INVALID CART ITEMS...");

    const invalidCartIds = cartItems
      .filter((cart) => !cart.itemId)
      .map((cart) => cart._id);

    console.log("❌ INVALID CART IDS:", invalidCartIds);

    if (invalidCartIds.length > 0) {
      console.log("🗑️ DELETING INVALID CART ITEMS...");

      const deleteResult = await Cart.deleteMany({
        _id: {
          $in: invalidCartIds,
        },
      });

      console.log("🗑️ DELETE RESULT:", deleteResult);
    } else {
      console.log("✅ NO INVALID CART ITEMS");
    }

    
    const validCartItems = cartItems.filter(
      (cart) => cart.itemId
    );

    

    if (validCartItems.length === 0) {
      console.log("❌ NO VALID CART ITEMS");

      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const firstCartItem = validCartItems[0];

    console.log("🍽️ FIRST CART ITEM:", firstCartItem);

    if (!firstCartItem || !firstCartItem.restaurantId) {
      console.log("❌ INVALID RESTAURANT DATA");

      return res.status(400).json({
        message: "Invalid Cart Data",
      });
    }

    const restaurantId = firstCartItem.restaurantId._id;

    
    const restaurant = await Restaurant.findById(restaurantId);


    if (!restaurant) {
      console.log("❌ RESTAURANT NOT FOUND");

      return res.status(404).json({
        message: "No restaurant with this id",
      });
    }

    if (!restaurant.isOpen) {
      console.log("❌ RESTAURANT CLOSED");

      return res.status(404).json({
        message: "Sorry this restaurant is closed for now",
      });
    }

    


    if (
      !address.location?.coordinates ||
      address.location.coordinates.length < 2
    ) {
      console.log("❌ INVALID ADDRESS COORDINATES");

      return res.status(400).json({
        message: "Invalid address location",
      });
    }

    if (
      !restaurant.autoLocation?.coordinates ||
      restaurant.autoLocation.coordinates.length < 2
    ) {
      console.log("❌ INVALID RESTAURANT COORDINATES");

      return res.status(400).json({
        message: "Invalid restaurant location",
      });
    }

    

    const distance = getDistanceKm(
      address.location.coordinates[1],
      address.location.coordinates[0],
      restaurant.autoLocation.coordinates[1],
      restaurant.autoLocation.coordinates[0]
    );

    let subtotal = 0;

    const orderItems = validCartItems.map((cart, index) => {
      
      const item = cart.itemId;

      console.log("🍴 ITEM:", item);
      console.log("🔢 QUANTITY:", cart.quauntity);

      if (!item) {
        console.log("❌ INVALID ITEM FOUND:", cart._id);

        throw new Error("Invalid cart item");
      }

      const itemTotal = item.price * cart.quauntity;

      

      subtotal += itemTotal;


      return {
        itemId: item._id.toString(),
        name: item.name,
        price: item.price,
        quauntity: cart.quauntity,
      };
    });

  
    const deliveryFee = subtotal < 250 ? 49 : 0;
    const platfromFee = 7;
    const totalAmount =
      subtotal + deliveryFee + platfromFee;

    
    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    const [longitude, latitude] =
      address.location.coordinates;

    const riderAmount = Math.ceil(distance) * 17;

   
    const order = await Order.create({
      userId: user._id.toString(),
      restaurantId: restaurantId.toString(),
      restaurantName: restaurant.name,
      riderId: null,
      distance,
      riderAmount,
      items: orderItems,
      subtotal,
      deliveryFee,
      platfromFee,
      totalAmount,
      addressId: address._id.toString(),

      deliveryAddress: {
        fromattedAddress: address.formattedAddress,
        mobile: address.mobile,
        latitude,
        longitude,
      },

      paymentMethod,
      paymentStatus: "pending",
      status: "placed",
      expiresAt,
    });

    

    const cartDeleteResult = await Cart.deleteMany({
      userId: user._id,
    });

 
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      orderId: order._id.toString(),
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error("\n❌❌❌ CREATE ORDER ERROR ❌❌❌");

    console.error("ERROR MESSAGE:", error?.message);
    console.error("ERROR NAME:", error?.name);
    console.error("ERROR STACK:", error?.stack);

    console.error("FULL ERROR:", error);

    console.error("❌❌❌ CREATE ORDER FAILED ❌❌❌\n");

    throw error;
  }
});

export const fetchOrderForPayment = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({
      message: "Order already paid",
    });
  }

  res.json({
    orderId: order._id,
    amount: order.totalAmount,
    currency: "INR",
  });
});


export const fetchRestaurantOrders = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { restaurantId } = req.params;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant id is required",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({
      restaurantId,
      paymentStatus: "paid",
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  }
);



const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"] as const;

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { orderId } = req.params;
    const { status } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(404).json({
        message: "Order not completed",
      });
    }

    const restaurant = await Restaurant.findById(order.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    if (restaurant.ownerId !== user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to update this order",
      });
    }

    order.status = status;

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `user:${order.userId}`,
        payload: {
          orderId: order._id,
          status: order.status,
        },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    // now assign riders here
    
    if (status === "ready_for_rider") {
      console.log(
        "Publishing Order ready for rider event for order",
        order._id
      );

      await publishEvent("ORDER_READY_FOR_RIDER", {
        orderId: order._id.toString(),
        restaurantId: restaurant._id.toString(),
        location: restaurant.autoLocation,
      });

      console.log("Event Published successfully");
    }


    res.json({
      message: "order status updated successfully",
      order,
    });
  }
);




export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
console.log("fgadvuyfbids");
 console.log(req.user);

  const orders = await Order.find({
    userId: req.user._id.toString(),
    paymentStatus: "paid",
  }).sort({ createdAt: -1 });


  console.log(orders);

  res.json({ orders });
});



export const fetchSingleOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to view this order",
      });
    }

    res.json(order);
  }
);



export const assignRiderToOrder = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId, riderId, riderName, riderPhone } = req.body;

  const orderAvailable = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  });

  if (orderAvailable) {
    return res.status(400).json({
      message: "You already have an order",
    });
  }

  const order = await Order.findById(orderId);

  if (order?.riderId !== null) {
    return res.status(400).json({
      message: "Order Already taken",
    });
  }

  const orderUpdated = await Order.findOneAndUpdate(
    { _id: orderId, riderId: null },
    {
      riderId,
      riderName,
      riderPhone,
      status: "rider_assigned",
    },
    { new: true }
  );

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `user:${order.userId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `restaurant:${order.restaurantId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );

  res.json({
    message: "Rider Assigned Successfully",
    success: true,
    order: orderUpdated,
  });
});

export const getCurrentOrderForRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const riderId = String(req.query.riderId || "");

  if (!riderId) {
    return res.status(400).json({
      message: "Rider id is required",
    });
  }

  const order = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  }).populate("restaurantId");

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.json(order);
});

export const updateOrderStatusRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.status === "rider_assigned") {
    order.status = "picked_up";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `restaurant:${order.restaurantId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }

  if (order.status === "picked_up") {
    order.status = "delivered";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `restaurant:${order.restaurantId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }
});

