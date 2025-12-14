const express = require("express");
const Router = express.Router();
const AuthUserController = require("../Controller/AuthUser.controller");
const verifyAdminMiddleware = require("../Middleware/verifyAdmin.middleware");

Router.post('/sendOtp', AuthUserController.SendOtp);
Router.post('/verifyOtp', AuthUserController.VerifyOtp);
Router.post('/register', AuthUserController.RegisterUser);
Router.post('/login', AuthUserController.LoginUser);
Router.get('/loginStatus', AuthUserController.LoginStatus);
Router.post('/logout', AuthUserController.LogOutUser);

module.exports = Router;