import { Router } from "express";
import auth from "./auth.js";
import transactions from "./transactions.js";

const router = Router();

router.use(auth)
router.use(transactions)

export default router;