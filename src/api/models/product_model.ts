import mongoose from "mongoose";
import Currency from "../../core/constants/currency_enum";
import ProductImageModel from "../dtos/product_image_model";
import { IngredientModel, defaultIngredients } from "../dtos/ingredients_model";
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
});

const Product = mongoose.model("Product", productSchema);
export default Product;
