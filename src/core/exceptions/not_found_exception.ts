import { ResponseStatus } from "../constants/response_status_enum";

export default class NotFoundException extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message ?? "Not found";
    this.statusCode = ResponseStatus.NOT_FOUND;
  }
}
