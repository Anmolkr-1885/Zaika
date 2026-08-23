import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string | null;
  riderPhone: number | null;
  riderName: string | null;
  distance: number;
  riderAmount: number;

  items: {
    itemId: string;
    name: string;
    price: number;
    quauntity: number;
  }[];

  subtotal: number;
  deliveryFee: number;
  platfromFee: number;
  totalAmount: number;

  addressId: string;

  deliveryAddress: {
    fromattedAddress: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };

  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_rider"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  paymentMethod: "razorpay" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";

  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: String,
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    riderId: {
      type: String,
      default: null,
    },
    riderName: {
      type: String,
      default: null,
    },
    riderPhone: {
      type: Number,
      default: null,
    },
    riderAmount: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },

    items: [
      {
        itemId: String,
        name: String,
        price: Number,
        quauntity: Number,
      },
    ],

    subtotal: Number,
    deliveryFee: Number,
    platfromFee: Number,
    totalAmount: Number,

    addressId: {
      type: String,
      required: true,
    },

    deliveryAddress: {
      fromattedAddress: { type: String, required: true },
      mobile: { type: Number, required: true },
      latitude: Number,
      longitude: Number,
    },

    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready_for_rider",
        "rider_assigned",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
