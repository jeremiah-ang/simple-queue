const createHttpError = require('http-errors');

const router = require('express').Router();

let lastId = 0;
let lastCustomer;
const customers = [];

router.get('/', function (req, res) {
  res.json({
    customers: customers,
  });
});

router.get('/current', function (req, res, next) {
  if (!lastCustomer) {
    return next(createHttpError(400, 'No Customer Served'));
  }

  res.json({
    customer: lastCustomer,
  });
});

router.post('/', function (req, res) {
  const customerName = req.body.name;
  lastId = lastId + 1;
  customers.push({
    id: lastId,
    name: customerName,
  });
  res.status(201).json({
    id: lastId,
  });
});

router.delete('/', function (req, res, next) {
  if (customers.length === 0) {
    return next(createHttpError(400, 'Empty Queue!'));
  }
  lastCustomer = customers.shift();
  res.json({ customer: lastCustomer });
});

module.exports = router;
