import express from "express";
import profileRoutes from "./profileRoutes.js";

const router = express.Router();

router.use("/profiles", profileRoutes);

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

export default router;
