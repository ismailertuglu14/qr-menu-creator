import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Models
import CategoryModel from "./category_model";
// Response
import BaseResponse from "../../core/response/base_response";

import upload from "../../core/storage/multer_storage";
import {
  customerGetCategories,
  restaurantGetCategories,
  createCategory,
  deleteCategory,
  relocateCategory,
} from "./category_controller";

const router = Router();
router.put("/relocate", authorizationMiddleware, relocateCategory);
router.get("/customer/all", customerGetCategories);
router.get("/restaurant/all", authorizationMiddleware, restaurantGetCategories);

// sonra bakılacak.
router.put(
  "/change-position",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { restaurantId, categoryId, newPosition } = req.body;

      // find the greates position parameter category
      const greatestPositionCategory = await CategoryModel.findOne({
        restaurantId,
      }).sort({ position: -1 });

      // find the category to be changed
      const category = await CategoryModel.findOne({
        _id: categoryId,
        restaurantId,
      });

      await CategoryModel.updateMany(
        {
          restaurantId,
        },
        {
          $set: {
            position: newPosition,
          },
        }
      );
    } catch (error) {
      res.send(500).json(BaseResponse.fail(error.message, error.statusCode));
    }
  }
);
router.post(
  "/create",
  upload.single("image"),
  authorizationMiddleware,

  createCategory
);

router.post("/delete", authorizationMiddleware, deleteCategory);
export default router;
