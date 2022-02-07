import { Router } from "express";
import { addIncome } from "../controllers/transactions.js";

const transactions = Router();

transactions.post("/addincome", addIncome);
export default transactions;