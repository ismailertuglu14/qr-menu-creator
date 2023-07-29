import mongoose from "mongoose";
import FeatureType from "./models/feature_type";
import PlanType from "./models/plan_enum";

const planSchema = new mongoose.Schema({
  tier: {
    type: Number,
    unique: true,
  },
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
  position: {
    type: Number,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
  updatedDate: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
