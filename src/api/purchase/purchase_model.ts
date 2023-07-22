import FeatureType from "../plan/feature_type";
import mongoose, { Mongoose, mongo } from "mongoose";
import PeriodType from "./models/period_tpe";

const Purchase = new mongoose.Schema({
  plan: {
    type: {
      _id: String,
      name: {
        type: String,
        required: true,
      },
      features: {
        type: Array<FeatureType>,
        required: true,
        default: null,
      },
      monthlyPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      annuallyPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      monthlyDiscount: {
        type: Number,
        required: true,
        default: 0,
      },
      annuallyDiscount: {
        type: Number,
        required: true,
        default: 0,
      },
      maxMenuCount: {
        type: Number,
        required: true,
      },
      maxProductCount: {
        type: Number,
        required: true,
      },
    },
    required: true,
  },
  restaurantId: {
    type: String,
    ref: "Restaurant",
    required: true,
  },
  periodType: {
    type: String,
    enum: PeriodType,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Purchase", Purchase);
