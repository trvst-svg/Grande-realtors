import { sign } from "crypto";
import createLand from "../Controllers/LandCRUD/land.create.js";
import login from "../Controllers/UserAuth/user.login.js";
import signup from "../Controllers/UserAuth/user.signup.js";
import TokenAuthenticator from "../Controllers/AuthMiddleware/auth.verifyUser.js";
import { Router } from "express";

const router = Router();

router.post("/user/signup", signup);
router.get("/user/login", login);
router.post("/land/post", TokenAuthenticator, createLand);


export default router;