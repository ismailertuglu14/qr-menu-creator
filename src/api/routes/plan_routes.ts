import { Router, Request, Response } from "express";

import authorizationMiddleware from "features/middlewares/authorization_middleware";

import Restaurant from "../models/restaurant_model";
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

// Utils
import { generateToken, verifyToken } from "../../features/utils/token_helper";

const router = Router();

router.post("/create", async (req: Request, res: Response, next) => {});

export default router;
