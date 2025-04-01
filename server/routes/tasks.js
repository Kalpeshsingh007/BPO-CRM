const express = require('express');
const router = express.Router();
const db = require('../data/inMemoryDB');

// Get all tasks
router.get('/', (req, res) => {
  res.json(db.tasks);
});

// Get task by ID
router.get('/:id', (req, res) => {
  const task = db.tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Create new task
router.post('/', (req, res) => {
  const newTask = {
    id: db.tasks.length + 1,
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    assignedTo: req.body.assignedTo,
    status: req.body.status || 'Pending',
    relatedTo: req.body.relatedTo,
    relatedId: req.body.relatedId
  };
  
  db.tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task
router.put('/:id', (req, res) => {
  const task = db.tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  
  Object.assign(task, req.body);
  res.json(task);
});

// Delete task
router.delete('/:id', (req, res) => {
  const index = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Task not found' });
  
  db.tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully' });
});

module.exports = router;