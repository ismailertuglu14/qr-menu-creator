import { ResponseStatus } from "../../core/constants/response_status_enum";

export default class OTPIncorrectException extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message ?? "OTP Incorrect";
    this.statusCode = ResponseStatus.OTP_INCORRECT;
  }
}
