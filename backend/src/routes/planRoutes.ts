import { Router } from "express";
import {
  allPlans,
  filteredPlans,
  planSearch,
  plansByAffinity,
} from "../controllers/planController";

const router = Router();

router.get("/", allPlans);
router.get("/filtered", filteredPlans);
router.get("/search", planSearch);
router.get("/affinity", plansByAffinity);

export default router;
