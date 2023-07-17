import { Router, Request, Response } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

import Restaurant from "./restaurant_model";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

//const upload = multer({ storage: storageFunction("restaurant-profile-image") });
import upload from "../../core/storage/multer_storage";
import StorageEnum from "../../core/constants/storage/storage_enum";
import { uploadImage, deleteImage } from "../../core/storage/azure_storage";
import { uploadFileRename } from "../../features/utils/file_helpers";
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
export default router;
