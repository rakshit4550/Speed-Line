import express from "express";
import {
  createSports,
  getAllSports,
  getSportsById,
  updateSports,
  deleteSports,
} from "../controllers/sports.js";

const router = express.Router();

router.post("/", createSports);

router.get("/", getAllSports);

router.get("/:id", getSportsById);

router.put("/:id", updateSports);

router.delete("/:id", deleteSports);

export default router;