import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role ?: "ADMIN" | "USER"
    }
  }
}