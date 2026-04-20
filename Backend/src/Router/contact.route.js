const express = require('express');
const router = express.Router();
const feedbackController = require('../Controller/contact.controller');

// Define the route and link it to the controller function
router.post('/feedback', feedbackController.createFeedback);

module.exports = router;