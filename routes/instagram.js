const { instagramData } = require('../controllers/instagram');

const router = require('express').Router();

router.post('/instagram', instagramData)

module.exports = router