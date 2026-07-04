export class AppError extends Error {
  constructor(message, status = 500, expose = status < 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.expose = expose;
  }
}

export function notFound(message = "Not found") {
  return new AppError(message, 404);
}

export function badRequest(message = "Invalid request") {
  return new AppError(message, 400);
}
