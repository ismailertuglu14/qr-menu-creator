import { Router, Request, Response } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

import Plan from "./plan_model";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

import Roles from "../../core/constants/role_enum";
async function getPlans(req: Request, res: Response) {
  try {
    const plans = await Plan.find({ isActive: true }, { __v: 0 }).sort({
      position: 1,
    });

    res.status(200).json(BaseResponse.success(plans, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message));
  }
}
async function updatePlan(req: Request, res: Response) {
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
      position,
      tier,
    } = req.body;

    const { id } = req.params;

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

    const plan = await Plan.findOneAndUpdate(
      { _id: id },
      {
        name,
        features,
        monthlyPrice,
        annuallyPrice,
        monthlyDiscount,
        annuallyDiscount,
        tier,
        maxMenuCount,
        maxProductCount,
        position,
        isActive: true,
      },
      { new: true }
    );
    return res

      .status(200)
      .json(BaseResponse.success(plan, ResponseStatus.SUCCESS));
  } catch (e) {
    return res.status(500).json(BaseResponse.fail(e.message));
  }
}

export { getPlans, updatePlan };
