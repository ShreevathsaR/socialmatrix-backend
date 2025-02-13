const { getContentSuggestions } = require('../controllers/aiSuggestions');
const router = require('express').Router();

router.get('/ai', getContentSuggestions)

module.exports = router