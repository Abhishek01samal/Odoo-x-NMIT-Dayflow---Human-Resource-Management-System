import express from "express";
import {
  healthCheckController,
  rootController,
} from "../controllers/root.controller.js";

const router = express.Router();

router.get("/", rootController);
router.get("/health-check", healthCheckController);

export { router as rootRouter };
