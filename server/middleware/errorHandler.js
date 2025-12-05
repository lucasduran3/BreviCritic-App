export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", {
    message: err.message,
    code: err.code,
    statusCode: err.statsCode,
    details: err.details,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal_server_error",
      code: err.code || "INTERNAL_ERROR",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      ...(err.details && { details: err.details }),
    },
    timestamp: new Date().toISOString(),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.path}`,
      code: "NOT_FOUND",
    },
    timestamp: new Date().toISOString(),
  });
}
