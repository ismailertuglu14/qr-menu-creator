import { Router } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import {
  changePassword,
  checkOTP,
  resetPassword,
  signin,
  signup,
} from "./authentication_controller";
const router = Router();

router.post("/signin", signin);
router.post("/google-login");
router.post("/signup", signup);
router.put("/change-password", authorizationMiddleware, changePassword);

// This is the first step of the reset password process.
router.post("/reset-password", resetPassword);
// This is the second step of the reset password process.
router.post("/check-otp", checkOTP);
export default router;
