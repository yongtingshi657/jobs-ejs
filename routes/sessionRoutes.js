const express = require('express')
const { registerShow, registerDo, logonShow, logoff } = require('../controllers/sessionController')
const passport = require("passport");

const router = express.Router()


router.route('/register').get(registerShow).post(registerDo)

router.route('/logon').get(logonShow).post(
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/sessions/logon",
      failureFlash: true,
    })
)

router.route('/logoff').post(logoff)

module.exports = router