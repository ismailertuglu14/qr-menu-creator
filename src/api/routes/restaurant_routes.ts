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
const upload = multer({ storage: storageFunction("restaurant-profile-image") });

router.post(
  "/change-profile-image",
  upload.single("image"),
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { restaurantId } = req.body;
      console.log("id: " + req.body.restaurantId);
      const filePath = req.file.path;
      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
      });
      console.log(restaurant);
      if (restaurant.profileImage) {
        if (fs.existsSync("uploads/" + restaurant.profileImage)) {
          fs.unlinkSync("uploads/" + restaurant.profileImage);
        }
      }
      restaurant.profileImage = req.file.filename;

      await Restaurant.updateOne(
        {
          _id: restaurantId,
        },
        {
          profileImage: req.file.filename,
        }
      );
      const imageurl = `${process.env.APP_URL}/uploads/restaurant-profile-image/${req.file.filename}`;
      res.status(200).json(BaseResponse.success(imageurl));
    } catch (error) {
      res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
    }
  }
);

export default router;
