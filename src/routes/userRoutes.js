const express = require('express');
const router = express.Router();

const usercontroller = require("../controllers/userController");

router.post("/authentication/register", usercontroller.create);

module.exports = router;