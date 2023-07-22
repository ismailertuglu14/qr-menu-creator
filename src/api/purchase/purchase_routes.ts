import { Router, Request, Response } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

import PurchaseModel from "./purchase_model";
import { getLatestPurchases, purchasePlan } from "./purchase_controller";

const router = Router();

router.get("/history", authorizationMiddleware, getLatestPurchases);
router.post("/:planId", authorizationMiddleware, purchasePlan);

export default router;
