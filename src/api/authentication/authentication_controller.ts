import { Request, Response, query } from "express";
import { signInValidator } from "../../features/validators/signin_validator";
import { signUpValidator } from "../../features/validators/signup_validator";

// Models
import ResturantCredential from "./restaurant_credential_model";
import Restaurant from "../restaurant/restaurant_model";
import PurchaseModel from "../purchase/purchase_model";
import PlanModel from "../plan/plan_model";
// Exceptions
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

// Utils
import {
  generateResetPasswordToken,
  generateToken,
} from "../../features/utils/token_helper";
import {
  hashPassword,
  comparePassword,
} from "../../features/utils/hash_password";

import NodeMailer from "nodemailer";

// Dtos
import TokenDto from "../dtos/token_dto";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import NotFoundException from "../../core/exceptions/not_found_exception";

import * as queryString from "querystring";
import BadRequestException from "../../core/exceptions/bad_request_exception";
import { generate6DigitCode } from "../../features/utils/number_helpers";
import OTPExpiredException from "../../core/exceptions/otp_expired_exception";
import OTPIncorrectException from "../../core/exceptions/otp_incorrect_exception";
import { mailHelper, passwordRequestMailWithOTP } from "./utils/mail_helper";
import PeriodType from "../../api/purchase/models/period_tpe";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import Provider from "./models/provider_model";

async function signin(req: Request, res: Response) {
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
      provider: Provider.INTERNAL,
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
}

async function signup(req: Request, res: Response) {
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

    const plan = await PlanModel.findOne({ tier: 0, isActive: true });
    const purchase = await PurchaseModel.create({
      plan,
      restaurantId: restauntCredentialResponse._id,
      purchaseDate: new Date(),
      expirationDate: new Date(8640000000000000),
      paymentMethod: "system",
      paymentStatus: "paid",
      price: 0,
      periodType: PeriodType.LIFETIME,
    });

    var restaurantResponse = await Restaurant.create({
      _id: restaurantCredential._id,
      name: restaurantName,
      currentPlanId: purchase._id,
    });

    const token = generateToken({
      id: restauntCredentialResponse._id,
      role: restaurantResponse.role,
    });

    return res
      .status(200)
      .json(BaseResponse.success(token, ResponseStatus.SUCCESS));
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
}
async function googleLoginRequest(req: Request, res: Response) {
  try {
    console.log("id", process.env.CLIENT_ID);

    const stringifiedParams = queryString.stringify({
      client_id: process.env.CLIENT_ID,
      redirect_uri: "http://localhost:3333/api/v1/auth/google",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "), // space seperated string
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });

    const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;

    return res
      .status(200)
      .json(BaseResponse.success(googleLoginUrl, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}
async function getTokens(
  code: any,
  clientId: any,
  clientSecret: any,
  redirectUri: any
) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };
  return axios
    .post(url, queryString.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data);
}
async function google(req: Request, res: Response) {
  const code = req.query.code as string;
  const { access_token } = await getTokens(
    code,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3333/api/v1/auth/google"
  );
  const googleUser = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
      access_token,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const { email, given_name, family_name } = googleUser.data;

  // Check is user unique
  const response: ResponseStatus = await checkIsUserUnique(null, email);

  const _rest = await ResturantCredential.findOne({
    email,
  });

  if (_rest && _rest.provider === Provider.GOOGLE) {
    const token = generateToken({
      id: _rest._id,
      role: _rest.role,
    });

    return res
      .status(200)
      .json(BaseResponse.success(token, ResponseStatus.SUCCESS));
  }

  const restaurantCredential = await ResturantCredential.create({
    email: email,
    hashedPassword: await hashPassword(given_name + family_name + email),
    provider: Provider.GOOGLE,
  });

  const plan = await PlanModel.findOne({ tier: 0, isActive: true });
  const purchase = await PurchaseModel.create({
    plan,
    restaurantId: restaurantCredential._id,
    purchaseDate: new Date(),
    expirationDate: new Date(8640000000000000),
    paymentMethod: "system",
    paymentStatus: "paid",
    price: 0,
    periodType: PeriodType.LIFETIME,
  });

  const restaurant = await Restaurant.create({
    _id: restaurantCredential._id,
    name: given_name + " " + family_name,
    currentPlanId: purchase._id,
  });

  const token = generateToken({
    id: restaurantCredential._id,
    role: restaurant.role,
  });

  res.status(200).json(BaseResponse.success(token, ResponseStatus.SUCCESS));
}
/**
 * This is the first step of resetPassword.
 */
async function resetPasswordRequest(req: Request, res: Response) {
  try {
    const { to } = req.body;
    if (!to) throw new BadRequestException("Email is required");
    const restaurant = await ResturantCredential.findOne({
      email: to,
      isActive: true,
    });

    if (!restaurant) throw new NotFoundException("Restaurant not found");

    const transporter = NodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const tenMinuteLater = new Date(new Date().getTime() + 10 * 60000);
    const oneHourLater = new Date(new Date().getTime() + 60 * 60000);

    restaurant.resetPasswordCode = generate6DigitCode().toString();
    restaurant.resetPasswordCodeExpiry = new Date(tenMinuteLater);

    restaurant.resetPassswordToken = generateResetPasswordToken();
    restaurant.resetPasswordTokenExpiry = new Date(oneHourLater);

    await transporter.sendMail({
      html: mailHelper(
        to,
        "Password Reset",
        passwordRequestMailWithOTP(restaurant.resetPasswordCode)
      ),
      from: process.env.SMTP_USER,
      to: to,
      subject: "Hello ✔",
    });

    await restaurant.save();
    res
      .status(200)
      .json(
        BaseResponse.success(
          restaurant.resetPassswordToken,
          ResponseStatus.SUCCESS
        )
      );
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
/**
 * @description This is the second step of resetPassword.
 * @description Check if OTP is valid or not after resetPassword request sent.
 *
 * @returns {number} 404 - ResponseStatus.NotFound Restaurant not found.
 * @returns {number} 1008  - ResponseStatus.OTP_EXPIRED if OTP is expired.
 * @returns {number } 1009 - ResponseStatus.OTP_INCORRECT if OTP is incorrect.
 * @returns {number} true & 200 - ResponseStatus.SUCCESS if OTP is valid.
 * @returns {number} 500 - ResponseStatus.INTERNAL_SERVER_ERROR if any error occurs.
 */
async function checkOTP(req: Request, res: Response) {
  try {
    const { email, otp, token } = req.body;
    const restaurant = await ResturantCredential.findOne({
      email: email,
      isActive: true,
    });

    if (!restaurant) throw new NotFoundException("Restaurant not found");

    if (
      token !== restaurant.resetPassswordToken ||
      restaurant.resetPasswordTokenExpiry < new Date()
    ) {
      throw new UnauthorizedException("UnAuthorized Access Denied");
    }

    if (!restaurant.resetPasswordCode)
      throw new NotFoundException("OTP not found");

    if (restaurant.resetPasswordCodeExpiry < new Date()) {
      restaurant.resetPasswordCode = null;
      restaurant.resetPasswordCodeExpiry = null;
      await restaurant.save();
      throw new OTPExpiredException("OTP expired");
    }

    if (restaurant.resetPasswordCode !== otp)
      throw new OTPIncorrectException("OTP incorrect");

    restaurant.resetPasswordCode = null;
    restaurant.resetPasswordCodeExpiry = null;
    await restaurant.save();
    res.status(200).json(BaseResponse.success(true, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    const restaurant = await ResturantCredential.findOne({
      resetPassswordToken: token,
      isActive: true,
    });

    if (!restaurant) throw new NotFoundException("Restaurant not found");

    if (restaurant.resetPasswordTokenExpiry < new Date()) {
      return res
        .status(401)
        .json(
          BaseResponse.fail(
            "Token expired",
            ResponseStatus.RESET_PASSWORD_EXPIRED
          )
        );
    }

    restaurant.hashedPassword = await hashPassword(newPassword);
    restaurant.resetPassswordToken = null;
    restaurant.resetPasswordTokenExpiry = null;
    await restaurant.save();
    res.status(200).json(BaseResponse.success(true, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

async function changePassword(req: Request, res: Response) {
  try {
    const { restaurantId, oldPassword, newPassword } = req.body;

    const restaurant = await ResturantCredential.findOne({
      _id: restaurantId,
    });

    if (!restaurant) throw new NotFoundException("Restaurant not found");

    if (!(await comparePassword(oldPassword, restaurant.hashedPassword)))
      throw new UnauthorizedException("Invalid password");

    restaurant.hashedPassword = await hashPassword(newPassword);
    await restaurant.save();

    return res.status(200).json(BaseResponse.success("Password changed"));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
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

export {
  signin,
  signup,
  googleLoginRequest,
  google,
  changePassword,
  resetPasswordRequest,
  checkOTP,
  resetPassword,
};
