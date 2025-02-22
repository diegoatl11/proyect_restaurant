const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/auth");


const usercontroller = require("../controllers/userController");

router.post("/authentication/register", usercontroller.create);

router.post("/authentication/login", usercontroller.login);

router.put("/authentication/update/:id", verifyToken, usercontroller.update);

router.delete("/authentication/delete/:id", verifyToken, usercontroller.delete);

module.exports = router;