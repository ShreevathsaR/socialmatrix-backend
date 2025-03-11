const { instagramData } = require('../controllers/instagram');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

const router = require('express').Router();

router.post('/instagram/:keyword',jwtMiddleware, instagramData)

module.exports = router