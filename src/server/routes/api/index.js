const express = require('express');
const testController = require('../../controllers/pages');

const router = express.Router();

// Slug gets changes to homepage in the global middleware
// The slug in Contentful should be homepage
router.get('/', testController.detail);

module.exports = router;
