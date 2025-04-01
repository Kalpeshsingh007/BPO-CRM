const express = require('express');
const router = express.Router();
const db = require('../data/inMemoryDB');

// Get all emails
router.get('/', (req, res) => {
  res.json(db.emails);
});

// Get emails by related entity
router.get('/related/:type/:id', (req, res) => {
  const type = req.params.type;
  const id = parseInt(req.params.id);
  
  const emails = db.emails.filter(email => email.relatedTo === type && email.relatedId === id);
  res.json(emails);
});

// Get email by ID
router.get('/:id', (req, res) => {
  const email = db.emails.find(e => e.id === parseInt(req.params.id));
  if (!email) return res.status(404).json({ message: 'Email not found' });
  res.json(email);
});

// Create new email
router.post('/', (req, res) => {
  const newEmail = {
    id: db.emails.length + 1,
    to: req.body.to,
    subject: req.body.subject,
    body: req.body.body,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'Sent',
    relatedTo: req.body.relatedTo,
    relatedId: parseInt(req.body.relatedId)
  };
  
  db.emails.push(newEmail);
  res.status(201).json(newEmail);
});

// Delete email
router.delete('/:id', (req, res) => {
  const index = db.emails.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Email not found' });
  
  db.emails.splice(index, 1);
  res.json({ message: 'Email deleted successfully' });
});

module.exports = router;