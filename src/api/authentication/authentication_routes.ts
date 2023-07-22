import { Router } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import { changePassword, signin, signup } from "./authentication_controller";
const router = Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.put("/change-password", authorizationMiddleware, changePassword);

export default router;
