const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();
router.post("/register", authController.registerUserController);
router.post("/login", authController.loginUserController);
router.post("/logout", authController.logoutUserController);
router.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = router;
