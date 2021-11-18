const router = require('express').Router();
const CustomersRouter = require('./customers');

// There's only 1 entity in this project "customers"
router.use('/customers', CustomersRouter);

module.exports = router;
