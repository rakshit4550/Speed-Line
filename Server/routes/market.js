import express from "express";
import { createMarket, deleteMarket, getAllMarkets, getMarketById, updateMarket } from "../controllers/market.js";

const router = express.Router();

router.post("/add", createMarket);
router.get("/all", getAllMarkets);
router.get("/:id", getMarketById);
router.put("/:id", updateMarket);
router.delete("/:id", deleteMarket);

export default router;