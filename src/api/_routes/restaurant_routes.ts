import { Router, Request, Response } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

import Restaurant from "../entities/restaurant_model";
import RestaurantCredential from "../entities/restaurant_credential_model";
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";

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
} from "../../api/_controllers/restaurant_controller";

const router = Router();

router.get("/", authorizationMiddleware, getRestaurantInformation);

router.post(
  "/change-profile-image",
  upload.single("image"),
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .send(
            BaseResponse.fail("File is required", ResponseStatus.BAD_REQUEST)
          );
      }
      const { restaurantId } = req.body;

      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
      });

      if (restaurant.profileImage) {
        // resim silinecek
        await deleteImage(
          StorageEnum.RESTAURANT_PROFILE_IMAGE,
          restaurant.profileImage
        );
      }
      const fileName = uploadFileRename(req.file.originalname);
      await uploadImage(
        StorageEnum.RESTAURANT_PROFILE_IMAGE,
        fileName,
        req.file
      );
      const fileUrl = `${process.env.AZURE_STORAGE_URL}/${StorageEnum.RESTAURANT_PROFILE_IMAGE}/${fileName}`;

      await Restaurant.updateOne(
        {
          _id: restaurantId,
        },
        {
          profileImage: fileName,
        }
      );
      res.status(200).json(BaseResponse.success(fileUrl));
    } catch (error) {
      console.log(error);
      res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
    }
  }
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
