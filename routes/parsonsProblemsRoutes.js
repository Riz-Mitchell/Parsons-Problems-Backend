const router = require('express').Router();
let ParsonProblem = require('../models/parsonProblem');
const parsonsProblemsController = require('../controllers/parsonsProblemsController');

/**
 * Don't forget to add the topic and the context params to the request
 */
router.post('/', parsonsProblemsController.createParsonProblem);

router.post('/submit/:id', parsonsProblemsController.submitSolution);

module.exports = router;
