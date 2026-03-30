import { ErrorDetail } from "../models/entities";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: ErrorDetail[];

  constructor(message: string, statusCode: number, details?: ErrorDetail[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}
