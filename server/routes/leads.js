const express = require('express');
const router = express.Router();
const db = require('../data/inMemoryDB');

// Get all leads
router.get('/', (req, res) => {
  res.json(db.leads);
});

// Get lead by ID
router.get('/:id', (req, res) => {
  const lead = db.leads.find(l => l.id === parseInt(req.params.id));
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(lead);
});

// Create new lead
router.post('/', (req, res) => {
  const newLead = {
    id: db.leads.length + 1,
    company: req.body.company,
    contact: req.body.contact,
    email: req.body.email,
    phone: req.body.phone,
    status: req.body.status || 'New',
    source: req.body.source,
    notes: req.body.notes
  };
  
  db.leads.push(newLead);
  res.status(201).json(newLead);
});

// Update lead
router.put('/:id', (req, res) => {
  const lead = db.leads.find(l => l.id === parseInt(req.params.id));
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  
  Object.assign(lead, req.body);
  res.json(lead);
});

// Delete lead
router.delete('/:id', (req, res) => {
  const index = db.leads.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Lead not found' });
  
  db.leads.splice(index, 1);
  res.json({ message: 'Lead deleted successfully' });
});

module.exports = router;