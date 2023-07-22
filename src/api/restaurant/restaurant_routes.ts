import { Router } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import upload from "../../core/storage/multer_storage";
import {
  getRestaurantInformation,
  addOrUpdateSocialMedia,
  deleteRestaurant,
  updateRestaurantInformation,
  changeResstaurantImage,
} from "./restaurant_controller";

const router = Router();

router.get("/", authorizationMiddleware, getRestaurantInformation);

router.post(
  "/change-profile-image",
  upload.single("image"),
  authorizationMiddleware,
  changeResstaurantImage
);
router.post("/social-media", authorizationMiddleware, addOrUpdateSocialMedia);
router.post("/delete", authorizationMiddleware, deleteRestaurant);
router.post(
  "/update",
  upload.single("image"),
  authorizationMiddleware,
  updateRestaurantInformation
);

router.post("/verify-request", authorizationMiddleware);
export default router;
