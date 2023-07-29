import { Router, Request, Response } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

import Plan from "./plan_model";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

import Roles from "../../core/constants/role_enum";
import { getPlans, updatePlan } from "./plan_controller";

const router = Router();
router.get("/", authorizationMiddleware, getPlans);
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
        maxMenuCount,
        maxProductCount,
        tier,
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
      const maxPositionPlan = await Plan.findOne().sort({ position: -1 });
      const position = maxPositionPlan ? maxPositionPlan.position + 1 : 1;
      const plan = new Plan({
        name,
        features,
        monthlyPrice,
        annuallyPrice,
        monthlyDiscount,
        annuallyDiscount,
        maxMenuCount,
        maxProductCount,
        position,
        isActive: true,
        tier,
      });

      await plan.save();
      return res
        .status(200)
        .json(BaseResponse.success(plan, ResponseStatus.SUCCESS));
    } catch (e) {
      return res.status(400).json(BaseResponse.fail(e.message));
    }
  }
);

router.post("/update/:id", authorizationMiddleware, updatePlan);

export default router;
