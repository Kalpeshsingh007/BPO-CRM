const express = require('express');
const router = express.Router();
const db = require('../data/inMemoryDB');

// Get all calls
router.get('/', (req, res) => {
  res.json(db.calls);
});

// Get calls by related entity
router.get('/related/:type/:id', (req, res) => {
  const type = req.params.type;
  const id = parseInt(req.params.id);
  
  const calls = db.calls.filter(call => call.relatedTo === type && call.relatedId === id);
  res.json(calls);
});

// Get call by ID
router.get('/:id', (req, res) => {
  const call = db.calls.find(c => c.id === parseInt(req.params.id));
  if (!call) return res.status(404).json({ message: 'Call not found' });
  res.json(call);
});

// Create new call
router.post('/', (req, res) => {
  const newCall = {
    id: db.calls.length + 1,
    contact: req.body.contact,
    phone: req.body.phone,
    date: req.body.date,
    duration: parseInt(req.body.duration),
    outcome: req.body.outcome,
    notes: req.body.notes,
    relatedTo: req.body.relatedTo,
    relatedId: parseInt(req.body.relatedId)
  };
  
  db.calls.push(newCall);
  res.status(201).json(newCall);
});

// Delete call
router.delete('/:id', (req, res) => {
  const index = db.calls.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Call not found' });
  
  db.calls.splice(index, 1);
  res.json({ message: 'Call deleted successfully' });
});

module.exports = router;