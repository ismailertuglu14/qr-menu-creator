import { Router, Request, Response } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

import Restaurant from "../models/restaurant_model";
import Plan from "../../api/models/plan_model";
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

import Roles from "../../core/constants/role_enum";

const router = Router();

router.post(
  "/create",
  authorizationMiddleware,
  async (req: Request, res: Response, next) => {
    try {
      const {
        role,
        name,
        features,
        monthlyPrice,
        annuallyPrice,
        monthlyDiscount,
        annuallyDiscount,
      } = req.body;
      if (role !== Roles.ADMIN) {
        return res
          .status(401)
          .json(
            BaseResponse.fail(
              "You are not authorized to create a role",
              ResponseStatus.UNAUTHORIZED
            )
          );
      }

      const plan = new Plan({
        name,
        features,
        monthlyPrice,
        annuallyPrice,
        monthlyDiscount,
        annuallyDiscount,
        isActive: true,
      });
      await plan.save();
      return res.status(200).json(BaseResponse.success(null));
    } catch (e) {
      return res.status(400).json(BaseResponse.fail(e.message));
    }
  }
);

export default router;
