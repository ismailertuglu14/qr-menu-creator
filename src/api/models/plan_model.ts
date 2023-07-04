import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  features: {
    type: Array<string>,
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
