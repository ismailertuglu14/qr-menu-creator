import { Router } from "express";

import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import {
  changePassword,
  checkOTP,
  googleLoginRequest,
  google,
  resetPassword,
  resetPasswordRequest,
  signin,
  signup,
} from "./authentication_controller";
const router = Router();

router.post("/signin", signin);
router.get("/test", googleLoginRequest);
router.post("/google-login", googleLoginRequest);
router.get("/google", google);
router.post("/signup", signup);
router.put("/change-password", authorizationMiddleware, changePassword);

// This is the first step of the reset password process.
router.post("/reset-password-request", resetPasswordRequest);
// This is the second step of the reset password process.
router.post("/check-otp", checkOTP);
// This is the third step of the reset password process.
router.post("/reset-password", resetPassword);
export default router;
