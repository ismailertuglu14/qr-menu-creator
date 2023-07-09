export default class BaseResponse<T> {
  data: T;
  isSuccess: boolean;
  statusCode: number;
  errors: Array<string>;

  constructor(
    data: T,
    isSuccess: boolean,
    statusCode: number,
    errors: Array<string>
  ) {
    this.data = data;
    this.isSuccess = isSuccess;
    this.statusCode = statusCode;
    this.errors = errors || [];
  }

  static success<T>(data: T, statusCode: number = 200): BaseResponse<T> {
    return new BaseResponse(data, true, statusCode, null);
  }

  static fail<T>(
    errors: string | Array<string>,
    statusCode: number = 500
  ): BaseResponse<T> {
    return new BaseResponse(
      null,
      false,
      statusCode,
      process.env.RUNTIME_ENV === "development"
        ? Array.isArray(errors)
          ? errors
          : [errors]
        : null
    );
  }
}
