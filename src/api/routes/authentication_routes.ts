import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import { signInValidator } from "../../features/validators/signin_validator";
import { signUpValidator } from "../../features/validators/signup_validator";

import ResturantCredential from "../models/restaurant_credential_model";
import {
  hashPassword,
  comparePassword,
} from "../../features/utils/hash_password";
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";

import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import TokenDto from "../dtos/token_dto";
import { generateToken, verifyToken } from "../../features/utils/token_helper";
const router = Router();

router.post("/signin", async (req: Request, res: Response, next) => {
  try {
    const { userNameOrEmail, password, restaurantId } = req.body;
    await signInValidator
      .validate({
        userNameOrEmail,
        password,
      })
      .then((value) => {
        //   console.log("hata : ", value);
      })
      .catch((_) => {
        throw new Error("Validation Error");
      });

    var response = await ResturantCredential.findOne({
      userName: userNameOrEmail,
    });

    if (!response) {
      throw new UnauthorizedException("Invalid username or password");
    }
    if (!(await comparePassword(password, response.hashedPassword))) {
      throw new UnauthorizedException("Invalid username or password");
    }
    const token = generateToken(response._id);

    return res.status(200).json(BaseResponse.success(token));
  } catch (e) {
    return res.status(500).json(BaseResponse.fail(e.message, e.statusCode));
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const {
      userName,
      email,
      password,
      passwordAgain,
      phone: { countryCode, phoneNumber },
    } = req.body;

    await signUpValidator
      .validate({
        email,
        password,
        passwordAgain,
        phoneNumber,
        countryCode,
      })
      .catch((_) => {
        throw new Error("Validation Error");
      });

    var responseUnique = await checkIsUserUnique(phoneNumber, email);

    if (responseUnique === ResponseStatus.EMAIL_ALREADY_EXISTS) {
      return res
        .status(200)
        .json(BaseResponse.fail("Email already exists", responseUnique));
    } else if (responseUnique === ResponseStatus.PHONE_NUMBER_ALREADY_EXISTS) {
      return res
        .status(200)
        .json(BaseResponse.fail("Phone number already exists", responseUnique));
    }

    var restaurantCredential = new ResturantCredential({
      userName: userName,
      email: email,
      hashedPassword: await hashPassword(password),
      phone: {
        countryCode: countryCode,
        phoneNumber: phoneNumber,
      },
    });
    var response = await ResturantCredential.create(restaurantCredential);
    console.log(response);
    if (!response) throw new Error("Error while creating user");

    return res.status(200).json({ message: response });
  } catch (error) {
    return res
      .status(500)
      .json(
        BaseResponse.fail(
          error.message || "Error while creating user",
          error.statusCode
        )
      );
  }
});

router.post("/signup-restaurant", (req: Request, response: Response) => {
  const {} = req.body;
});

/**
 * @param userName
 * @param email
 * @param ResponseStatus.SUCCESS if username and email are unique.
 * @param ResponseStatus.EMAIL_ALREADY_EXISTS if email already exists in database.
 */
async function checkIsUserUnique(
  phoneNumber: string,
  email: string
): Promise<ResponseStatus> {
  const user = await ResturantCredential.findOne({
    $or: [{ "phone.phoneNumber": phoneNumber }, { email: email }],
  });
  if (!user) return ResponseStatus.SUCCESS;
  else if (user.email === email) {
    return ResponseStatus.EMAIL_ALREADY_EXISTS;
  } else if (user.phone.phoneNumber === phoneNumber) {
    return ResponseStatus.PHONE_NUMBER_ALREADY_EXISTS;
  }
  return ResponseStatus.INTERNAL_SERVER_ERROR;
}

export default router;
