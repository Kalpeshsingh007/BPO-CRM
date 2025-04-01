const express = require('express');
const router = express.Router();
const db = require('../data/inMemoryDB');

// Get all customers
router.get('/', (req, res) => {
  res.json(db.customers);
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const customer = db.customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

// Create new customer
router.post('/', (req, res) => {
  const newCustomer = {
    id: db.customers.length + 1,
    name: req.body.name,
    contact: req.body.contact,
    email: req.body.email,
    phone: req.body.phone,
    status: req.body.status || 'New',
    lastContact: new Date().toISOString().split('T')[0]
  };
  
  db.customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Update customer
router.put('/:id', (req, res) => {
  const customer = db.customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  
  Object.assign(customer, req.body);
  res.json(customer);
});

// Delete customer
router.delete('/:id', (req, res) => {
  const index = db.customers.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Customer not found' });
  
  db.customers.splice(index, 1);
  res.json({ message: 'Customer deleted successfully' });
});

module.exports = router;