import { Router } from "express";
import { login, signUp } from "../controllers/auth.js";

const auth = Router();
auth.post("/sign-up", signUp);
auth.post("/login", login);

export default auth;