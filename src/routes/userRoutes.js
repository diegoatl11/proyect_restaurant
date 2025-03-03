const express = require('express');
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/authorizeRoles");
const usercontroller = require("../controllers/userController");
const { ROLES } = require("../utils/roles")

router.post("/authentication/register", verifyToken, authorizeRoles(ROLES.ADMIN), usercontroller.create);

router.post("/authentication/login", usercontroller.login);

router.put("/authentication/update/:id", verifyToken, usercontroller.update);

router.delete("/authentication/delete/:id", verifyToken, usercontroller.delete);

router.post("/logout", verifyToken, usercontroller.logout);

router.get("/authentication/getuserinfo", verifyToken, usercontroller.getUserInfo);

module.exports = router;