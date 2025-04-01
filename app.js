const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database initialization
const db = require('./server/data/inMemoryDB');

// Import routes
const customerRoutes = require('./server/routes/customers');
const leadRoutes = require('./server/routes/leads');
const taskRoutes = require('./server/routes/tasks');
const emailRoutes = require('./server/routes/emails');
const callRoutes = require('./server/routes/calls');

// Use routes
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/calls', callRoutes);

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/customers', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'customers.html'));
});

app.get('/leads', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'leads.html'));
});

app.get('/tasks', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tasks.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'reports.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});