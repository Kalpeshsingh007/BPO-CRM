const express = require('express');
const router = express.Router();
const db = require('../data/inMemoryDB');
const callService = require('../utils/callService');

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

// Make a new call
router.post('/make', async (req, res) => {
  try {
    const { phone, message, relatedTo, relatedId, contactName, callScript } = req.body;
    
    // Generate TwiML for the call
    const twimlUrl = `${req.protocol}://${req.get('host')}/api/calls/twiml`;
    
    // Make the call
    const result = await callService.makeCall(phone, twimlUrl);
    
    if (result.success) {
      // Log the call in the database
      const newCall = {
        id: db.calls.length + 1,
        contact: contactName,
        phone: phone,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        duration: 0, // Will be updated when call ends
        outcome: 'Initiated',
        notes: callScript || message,
        relatedTo: relatedTo,
        relatedId: parseInt(relatedId),
        callSid: result.callSid
      };
      
      db.calls.push(newCall);
      res.status(201).json(newCall);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ error: error.message });
  }
});

// TwiML endpoint for calls
router.post('/twiml', (req, res) => {
  // Get call parameters from request or use defaults
  const callScript = req.body.script || "Hello, this is a call from BPO CRM. Our representative will be with you shortly.";
  
  // Generate TwiML
  const twiml = callService.generateCallTwiML({
    message: callScript,
    record: true
  });
  
  // Set content type and send response
  res.type('text/xml');
  res.send(twiml);
});

// Update call with outcome
router.put('/:id', (req, res) => {
  const call = db.calls.find(c => c.id === parseInt(req.params.id));
  if (!call) return res.status(404).json({ message: 'Call not found' });
  
  // Update call properties
  Object.assign(call, req.body);
  
  res.json(call);
});

// Delete call
router.delete('/:id', (req, res) => {
  const index = db.calls.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Call not found' });
  
  db.calls.splice(index, 1);
  res.json({ message: 'Call deleted successfully' });
});

module.exports = router;