const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const notificationRouter = require('./notification');
const pdfRouter = require('./pdf');
const assessmentRouter = require('./assessment');

router.use('/auth', authRouter);
router.use('/notifications', notificationRouter);
router.use('/pdfs', pdfRouter);
router.use('/assessments', assessmentRouter);

module.exports = router;
