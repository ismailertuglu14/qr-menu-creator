import { Router, Request, Response } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

import MulterStorage from "../../core/storage/multer_storage";

import Restaurant from "../models/restaurant_model";
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";

import multer from "multer";
// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

// Utils
import { generateToken, verifyToken } from "../../features/utils/token_helper";
import fs from "fs";
import storageFunction from "../../core/storage/multer_storage";

const router = Router();
//const upload = multer({ storage: storageFunction("restaurant-profile-image") });
import upload from "../../core/storage/multer_storage";
import StorageEnum from "../../core/constants/storage/storage_enum";
import { uploadImage, deleteImage } from "../../core/storage/azure_storage";
import { uploadFileRename } from "../../features/utils/file_helpers";

router.post(
  "/change-profile-image",
  upload.single("image"),
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).send("Yüklenen dosya bulunamadı!");
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
      const imageurl = `${process.env.APP_URL}/uploads/restaurant-profile-image/${req.file.filename}`;
      res.status(200).json(BaseResponse.success(fileUrl));
    } catch (error) {
      console.log(error);
      res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
    }
  }
);

export default router;
