import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";

export default function authorizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bearerToken: string = req.headers.authorization;
  if (!bearerToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token: string = bearerToken.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = getRestaurantIdFromToken(token);

  if (!userId || !isValidObjectId(userId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.body.restaurantId = userId;

  return next();
}
function getRestaurantIdFromToken(token: string): string {
  const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
  if (!decodedToken) {
    return null;
  } else {
    return (decodedToken as jwt.JwtPayload).ID;
  }
}
