import TokenDto from "api/dtos/token_dto";
import JWT, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRATION = 60 * 60 * 24 * 30; // 1 month
const REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 30 * 2; // 2 months
export function generateToken(payload: any): TokenDto {
  const accessToken = JWT.sign({ id: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
  return {
    accessToken: accessToken,
    expiration: new Date(Date.now() + ACCESS_TOKEN_EXPIRATION * 1000),
    refreshToken: "",
  };
}

export function verifyToken(token: string) {
  return JWT.verify(token, process.env.JWT_SECRET_KEY);
}
