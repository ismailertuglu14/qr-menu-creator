import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import Roles from "core/constants/role_enum";

export default function authorizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bearerToken: string = req.headers.authorization;
  if (!bearerToken) {
    return res
      .status(401)
      .json(BaseResponse.fail("Unauthorized", ResponseStatus.UNAUTHORIZED));
  }
  const token: string = bearerToken.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json(BaseResponse.fail("Unauthorized", ResponseStatus.UNAUTHORIZED));
  }
  const restaurantId = getRestaurantIdFromToken(token);

  if (!restaurantId || !isValidUUIDv4(restaurantId)) {
    return res
      .status(401)
      .json(BaseResponse.fail("Unauthorized", ResponseStatus.UNAUTHORIZED));
  }

  req.body.restaurantId = restaurantId;
  req.body.role = getRoleFromToken(token);
  next();
}
function getRestaurantIdFromToken(token: string): string {
  const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
  if (!decodedToken) {
    return null;
  } else {
    return (decodedToken as jwt.JwtPayload).id;
  }
}
function getRoleFromToken(token: string): Roles {
  const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
  if (!decodedToken) {
    return null;
  }
  return (decodedToken as jwt.JwtPayload).role;
}
const isValidUUIDv4 = (uuid: any) => {
  const uuidv4Pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Pattern.test(uuid);
};
