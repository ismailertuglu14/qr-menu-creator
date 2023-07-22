import mongoose, { mongo } from "mongoose";
import Currency from "../../core/constants/currency_enum";
import ProductImageModel from "../dtos/product/product_image_model";
import {
  IngredientModel,
  defaultIngredients,
} from "../dtos/product/ingredients_model";
import {
  NutritionModel,
  defaultNutritionTypes,
} from "../dtos/product/nutritions_model";
const productSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
  },
  menuId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  ingredients: {
    type: Array<IngredientModel>,
    default: defaultIngredients,
  },
  nutritions: {
    type: Array<NutritionModel>,
    default: defaultNutritionTypes,
  },
  allergens: {
    type: String,
  },
  price: {
    type: Number,
  },
  currency: {
    type: String,
    enum: Currency,
    default: Currency.TL,
  },
  images: {
    type: Array<ProductImageModel>,
  },
  position: {
    type: Number,
    required: true,
  },
  createdDate: {
    type: Date,
  },
  updatedDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
