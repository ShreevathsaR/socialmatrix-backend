const { getContentSuggestions } = require('../controllers/aiSuggestions');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const router = require('express').Router();

router.get('/ai',jwtMiddleware, getContentSuggestions)

module.exports = router