const express = require('express');
const Router = express.Router();
const adminController = require('../Controller/admin.controller');
const verifyAdminMiddleware = require('../Middleware/verifyAdmin.middleware');

// Router.post("/loginAdmin", adminController.LoginAdmin)
Router.get("/adminDashboard", verifyAdminMiddleware, adminController.getAdminDashboard)
Router.delete("/deleteUser/:id", verifyAdminMiddleware, adminController.deleteUser)
Router.delete("/deleteListing/:id", verifyAdminMiddleware, adminController.deleteListing)

module.exports = Router;