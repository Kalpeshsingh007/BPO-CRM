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
    notes: req.body.notes,
    // BPO specific fields
    serviceInterest: req.body.serviceInterest || [],
    industryType: req.body.industryType || '',
    companySize: req.body.companySize || '',
    budget: req.body.budget || '',
    timeline: req.body.timeline || '',
    currentProvider: req.body.currentProvider || '',
    decisionMaker: req.body.contact === req.body.decisionMaker ? true : req.body.decisionMaker || false,
    painPoints: req.body.painPoints || '',
    requirements: req.body.requirements || '',
    createdAt: new Date().toISOString().split('T')[0],
    lastActivity: new Date().toISOString().split('T')[0]
  };
  
  db.leads.push(newLead);
  res.status(201).json(newLead);
});

// Update lead
router.put('/:id', (req, res) => {
  const lead = db.leads.find(l => l.id === parseInt(req.params.id));
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  
  // Update lead with new data
  Object.assign(lead, req.body);
  
  // Update last activity timestamp
  lead.lastActivity = new Date().toISOString().split('T')[0];
  
  res.json(lead);
});

// Delete lead
router.delete('/:id', (req, res) => {
  const index = db.leads.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Lead not found' });
  
  db.leads.splice(index, 1);
  res.json({ message: 'Lead deleted successfully' });
});

// Get lead activities (communications, tasks)
router.get('/:id/activities', (req, res) => {
  const leadId = parseInt(req.params.id);
  
  // Get all emails related to this lead
  const emails = db.emails ? db.emails.filter(email => 
    email.relatedTo === 'lead' && email.relatedId === leadId
  ) : [];
  
  // Get all calls related to this lead
  const calls = db.calls ? db.calls.filter(call => 
    call.relatedTo === 'lead' && call.relatedId === leadId
  ) : [];
  
  // Get all tasks related to this lead
  const tasks = db.tasks ? db.tasks.filter(task => 
    task.relatedTo === 'lead' && task.relatedId === leadId
  ) : [];
  
  // Combine and sort by date
  const activities = [
    ...emails.map(email => ({ 
      type: 'email', 
      date: email.date, 
      subject: email.subject,
      details: email.body.substring(0, 100) + '...',
      id: email.id
    })),
    ...calls.map(call => ({ 
      type: 'call', 
      date: call.date, 
      subject: `Call with ${call.contact}`,
      details: call.notes.substring(0, 100) + '...',
      id: call.id,
      outcome: call.outcome
    })),
    ...tasks.map(task => ({ 
      type: 'task', 
      date: task.dueDate, 
      subject: task.title,
      details: task.description,
      id: task.id,
      status: task.status
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(activities);
});

// Convert lead to customer
router.post('/:id/convert', (req, res) => {
  const lead = db.leads.find(l => l.id === parseInt(req.params.id));
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  
  // Create new customer from lead
  const newCustomer = {
    id: db.customers.length + 1,
    name: lead.company,
    contact: lead.contact,
    email: lead.email,
    phone: lead.phone,
    status: 'Active',
    lastContact: new Date().toISOString().split('T')[0],
    // BPO specific fields
    services: lead.serviceInterest,
    industry: lead.industryType,
    size: lead.companySize,
    contractValue: req.body.contractValue || '',
    contractStart: req.body.contractStart || new Date().toISOString().split('T')[0],
    contractEnd: req.body.contractEnd || '',
    accountManager: req.body.accountManager || '',
    notes: lead.notes,
    requirements: lead.requirements,
    decisionMaker: lead.decisionMaker,
    billingAddress: req.body.billingAddress || '',
    billingContact: req.body.billingContact || lead.contact
  };
  
  // Add new customer
  db.customers.push(newCustomer);
  
  // Create conversion task
  const conversionTask = {
    id: db.tasks.length + 1,
    title: `Onboard new customer: ${lead.company}`,
    description: `Complete onboarding process for ${lead.company} who converted from lead to customer.`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    assignedTo: req.body.accountManager || 'Admin',
    status: 'Pending',
    relatedTo: 'customer',
    relatedId: newCustomer.id
  };
  
  // Add conversion task
  db.tasks.push(conversionTask);
  
  // Remove lead (optional - can also just mark as converted)
  if (req.body.removeLead) {
    const leadIndex = db.leads.findIndex(l => l.id === parseInt(req.params.id));
    db.leads.splice(leadIndex, 1);
  } else {
    // Mark lead as converted
    lead.status = 'Converted';
    lead.convertedCustomerId = newCustomer.id;
    lead.convertedDate = new Date().toISOString().split('T')[0];
  }
  
  res.json({ 
    message: 'Lead converted successfully',
    customer: newCustomer,
    task: conversionTask
  });
});

// Get BPO service offerings (for dropdown lists)
router.get('/services/offerings', (req, res) => {
  // BPO service offerings
  const serviceOfferings = [
    {
      category: 'Customer Support',
      services: [
        'Inbound Call Center',
        'Outbound Call Center',
        'Email Support',
        'Live Chat Support',
        'Social Media Support',
        'Technical Support',
        'Help Desk Services'
      ]
    },
    {
      category: 'Back Office',
      services: [
        'Data Entry',
        'Data Processing',
        'Document Management',
        'Claims Processing',
        'Order Processing',
        'Accounts Payable/Receivable',
        'Payroll Processing'
      ]
    },
    {
      category: 'IT Services',
      services: [
        'Application Support',
        'Network Support',
        'Software Development',
        'Database Management',
        'IT Help Desk',
        'DevOps Services',
        'QA Testing'
      ]
    },
    {
      category: 'Human Resources',
      services: [
        'Recruitment Process Outsourcing',
        'Employee Onboarding',
        'Benefits Administration',
        'HR Compliance',
        'Training & Development',
        'Employee Records Management'
      ]
    },
    {
      category: 'Finance & Accounting',
      services: [
        'Bookkeeping',
        'Financial Reporting',
        'Tax Preparation',
        'Financial Analysis',
        'Accounts Reconciliation',
        'Budgeting & Forecasting'
      ]
    },
    {
      category: 'Healthcare',
      services: [
        'Medical Billing',
        'Medical Coding',
        'Healthcare Information Management',
        'Clinical Documentation',
        'Revenue Cycle Management',
        'Telehealth Support'
      ]
    }
  ];
  
  res.json(serviceOfferings);
});

// Get lead scoring
router.get('/:id/score', (req, res) => {
  const lead = db.leads.find(l => l.id === parseInt(req.params.id));
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  
  // Calculate lead score based on various factors
  let score = 0;
  
  // Basic information completeness (max 20 points)
  if (lead.company) score += 5;
  if (lead.contact) score += 5;
  if (lead.email) score += 5;
  if (lead.phone) score += 5;
  
  // Engagement level (max 30 points)
  // Count activities (emails, calls, tasks)
  const emailCount = db.emails ? db.emails.filter(email => 
    email.relatedTo === 'lead' && email.relatedId === lead.id
  ).length : 0;
  
  const callCount = db.calls ? db.calls.filter(call => 
    call.relatedTo === 'lead' && call.relatedId === lead.id
  ).length : 0;
  
  const taskCount = db.tasks ? db.tasks.filter(task => 
    task.relatedTo === 'lead' && task.relatedId === lead.id
  ).length : 0;
  
  // Score based on activity count
  score += Math.min(10, emailCount * 2); // 2 points per email, max 10
  score += Math.min(15, callCount * 3); // 3 points per call, max 15
  score += Math.min(5, taskCount * 1); // 1 point per task, max 5
  
  // BPO qualification factors (max 50 points)
  if (lead.budget) score += 10;
  if (lead.serviceInterest && lead.serviceInterest.length > 0) score += 10;
  if (lead.timeline) score += 10;
  if (lead.decisionMaker === true) score += 10;
  if (lead.companySize) score += 10;
  
  // Calculate quality rating
  let qualityRating = 'Cold';
  if (score >= 75) qualityRating = 'Hot';
  else if (score >= 50) qualityRating = 'Warm';
  
  res.json({
    leadId: lead.id,
    score: score,
    maxScore: 100,
    qualityRating: qualityRating,
    details: {
      informationCompleteness: Math.min(20, (lead.company ? 5 : 0) + (lead.contact ? 5 : 0) + (lead.email ? 5 : 0) + (lead.phone ? 5 : 0)),
      engagementLevel: Math.min(30, (Math.min(10, emailCount * 2) + Math.min(15, callCount * 3) + Math.min(5, taskCount * 1))),
      qualificationFactors: Math.min(50, (lead.budget ? 10 : 0) + 
        (lead.serviceInterest && lead.serviceInterest.length > 0 ? 10 : 0) + 
        (lead.timeline ? 10 : 0) + 
        (lead.decisionMaker === true ? 10 : 0) + 
        (lead.companySize ? 10 : 0))
    }
  });
});

// Get BPO industry types
router.get('/industry/types', (req, res) => {
  const industryTypes = [
    'Healthcare',
    'Financial Services',
    'Insurance',
    'Retail',
    'E-commerce',
    'Technology',
    'Telecommunications',
    'Manufacturing',
    'Travel & Hospitality',
    'Transportation & Logistics',
    'Energy & Utilities',
    'Education',
    'Government',
    'Media & Entertainment',
    'Non-profit',
    'Professional Services',
    'Real Estate',
    'Other'
  ];
  
  res.json(industryTypes);
});

module.exports = router;