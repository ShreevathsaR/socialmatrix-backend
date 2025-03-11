const { getYoutubeAPIData } = require('../controllers/youtube');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

const router = require('express').Router();

router.get('/youtube', jwtMiddleware, getYoutubeAPIData)

module.exports = router