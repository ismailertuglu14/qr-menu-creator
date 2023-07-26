import { ResponseStatus } from "../../core/constants/response_status_enum";

export default class OTPExpiredException extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message ?? "OTP Expired";
    this.statusCode = ResponseStatus.OTP_EXPIRED;
  }
}
