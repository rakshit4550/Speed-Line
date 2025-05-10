import express from "express";
import {
  createWhitelabel,
  deleteWhitelabel,
  getAllWhitelabels,
  getWhitelabelById,
  updateWhitelabel,
  uploadMiddleware,
} from "../controllers/whiteLabel.js";

const router = express.Router();

router.post("/create", uploadMiddleware, createWhitelabel);
router.get("/all", getAllWhitelabels);
router.get("/:id", getWhitelabelById);
router.put("/:id", uploadMiddleware, updateWhitelabel);
router.delete("/:id", deleteWhitelabel);

export default router;
