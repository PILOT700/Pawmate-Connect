export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }

  static badRequest(message = "Bad request"): HttpError {
    return new HttpError(400, message);
  }

  static unauthorized(message = "Not signed in"): HttpError {
    return new HttpError(401, message);
  }

  static notFound(message = "Not found"): HttpError {
    return new HttpError(404, message);
  }

  static conflict(message = "Already exists"): HttpError {
    return new HttpError(409, message);
  }
}
