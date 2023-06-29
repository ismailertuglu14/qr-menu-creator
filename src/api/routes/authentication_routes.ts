import { Router, Request, Response } from "express";
import { signInValidator } from "../../features/validators/signin_validator";
import { signUpValidator } from "../../features/validators/signup_validator";

// Models
import ResturantCredential from "../models/restaurant_credential_model";
import Restaurant from "../models/restaurant_model";

// Exceptions
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

// Utils
import { generateToken, verifyToken } from "../../features/utils/token_helper";
import {
  hashPassword,
  comparePassword,
} from "../../features/utils/hash_password";

// Dtos
import TokenDto from "../dtos/token_dto";
const router = Router();

router.post("/signin", async (req: Request, res: Response, next) => {
  try {
    const { email, password, restaurantId } = req.body;
    await signInValidator
      .validate({
        email,
        password,
      })
      .catch((_) => {
        throw new Error("Validation Error");
      });

    var response = await ResturantCredential.findOne({
      email: email,
    });

    if (!response) {
      throw new UnauthorizedException("Invalid email or password");
    }
    if (!(await comparePassword(password, response.hashedPassword))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    var restaurant = await Restaurant.findOne({
      _id: response._id,
    });

    const token = generateToken({
      id: response._id,
      role: restaurant.role,
    });

    return res.status(200).json(BaseResponse.success(token));
  } catch (e) {
    return res.status(500).json(BaseResponse.fail(e.message, e.statusCode));
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const {
      restaurantName,
      email,
      password,
      passwordAgain,
      phone: { countryCode, phoneNumber },
    } = req.body;

    await signUpValidator
      .validate({
        restaurantName,
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
      email: email,
      hashedPassword: await hashPassword(password),
      phone: {
        countryCode: countryCode,
        phoneNumber: phoneNumber,
      },
    });
    var restauntCredentialResponse = await ResturantCredential.create(
      restaurantCredential
    );
    if (!restauntCredentialResponse)
      throw new Error("Error while creating user");

    var restaurant = new Restaurant({
      _id: restaurantCredential._id,
      name: restaurantName,
    });
    var restaurantResponse = await Restaurant.create(restaurant);
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { restauntCredentialResponse, restaurantResponse },
          ResponseStatus.SUCCESS
        )
      );
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

/**
 * @param phoneNumber
 * @param email
 * @param ResponseStatus.SUCCESS if phoneNumber and email are unique.
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
