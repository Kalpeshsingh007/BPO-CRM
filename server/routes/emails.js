const express = require('express');
const router = express.Router();
const db = require('../data/inMemoryDB');
const emailService = require('../utils/emailService');
const fs = require('fs');
const path = require('path');

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

// Send a new email
router.post('/send', async (req, res) => {
  try {
    const { to, subject, body, relatedTo, relatedId, template, templateData } = req.body;
    
    let htmlContent = body;
    
    // If template is provided, use it
    if (template) {
      // Example of using a template
      const templatePath = path.join(__dirname, '../templates', `${template}.html`);
      
      if (fs.existsSync(templatePath)) {
        let templateContent = fs.readFileSync(templatePath, 'utf8');
        
        // Replace template variables with actual data
        if (templateData) {
          Object.keys(templateData).forEach(key => {
            templateContent = templateContent.replace(new RegExp(`{{${key}}}`, 'g'), templateData[key]);
          });
        }
        
        htmlContent = templateContent;
      }
    }
    
    // Send the email
    const result = await emailService.sendEmail(
      to,
      subject,
      body, // Plain text version
      htmlContent // HTML version
    );
    
    if (result.success) {
      // Log the email in the database
      const newEmail = {
        id: db.emails.length + 1,
        to: to,
        subject: subject,
        body: body,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Sent',
        relatedTo: relatedTo,
        relatedId: parseInt(relatedId),
        messageId: result.messageId
      };
      
      db.emails.push(newEmail);
      res.status(201).json(newEmail);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete email
router.delete('/:id', (req, res) => {
  const index = db.emails.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Email not found' });
  
  db.emails.splice(index, 1);
  res.json({ message: 'Email deleted successfully' });
});

module.exports = router;