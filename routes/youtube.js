const { getYoutubeAPIData } = require('../controllers/youtube');

const router = require('express').Router();

router.get('/youtube', getYoutubeAPIData)

module.exports = router