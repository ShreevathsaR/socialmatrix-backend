const { instagramData } = require('../controllers/instagram');

const router = require('express').Router();

router.post('/instagram/:keyword', instagramData)

module.exports = router