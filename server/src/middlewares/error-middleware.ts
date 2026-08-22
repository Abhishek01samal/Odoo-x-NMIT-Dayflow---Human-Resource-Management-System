import ApiError from "../utils/api-error.js";

const errorMiddleware = (err: any, req: any, res: any, next: any) => {
  if (err instanceof ApiError) {
    console.error("[ERROR]:", err);
    return res.status(err.statusCode).json(err);
  }

  if (err?.name === "ZodError") {
    return res
      .status(400)
      .json(new ApiError(400, err.issues?.[0]?.message ?? "Validation error"));
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }

  console.error(err);
  return res
    .status(500)
    .json(new ApiError(500, err?.message ?? "Internal Server Error"));
};

export default errorMiddleware;
