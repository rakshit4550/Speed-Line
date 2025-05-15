import express from "express";
import {
  getAllSports,
  createSport,
  updateSport,
  deleteSport,
  getSportById,
} from "../controllers/sports.js";

const router = express.Router();

router.post("/", createSport);
router.get("/", getAllSports);
router.get("/:id", getSportById);
router.put("/:id", updateSport);
router.delete("/:id", deleteSport);

export default router;