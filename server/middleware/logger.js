export function logger(req, res, next) {
  res.on("finish", () => {
    const start = Date.now();

    const log = {
      duration: Date.now() - start,
      method: req.method,
      path: req.path,
      status: res.statusCode,
    };

    console.log(`${log.status} ${log.method} ${log.path} ${log.duration}ms`);
  });

  next();
}
