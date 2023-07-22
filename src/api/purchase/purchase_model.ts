import mongoose from "mongoose";

const Purchase = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
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
  status: {
    type: String,
    required: true,
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
