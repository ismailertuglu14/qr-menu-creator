import { ResponseStatus } from "../constants/response_status_enum";

export default class BadRequestException extends Error {
  statusCode: number;

  constructor(message?: string) {
    super(message);
    this.message = message ?? "Bad Request";
    this.statusCode = ResponseStatus.BAD_REQUEST;
  }
}
