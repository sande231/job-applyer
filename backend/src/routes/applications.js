import express from 'express';
import { db } from '../db/init.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.json({ success: true, applications: db.getAll() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, company, portal, status = 'Pending', date, location, job_type, notes } = req.body;
    if (!title || !company || !portal || !date) {
      return res.status(400).json({ error: 'title, company, portal, and date are required' });
    }
    const app = db.create({ title, company, portal, status, date, location: location || '', job_type: job_type || '', notes: notes || '' });
    res.status(201).json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create application' });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = db.update(req.params.id, { ...(status !== undefined && { status }), ...(notes !== undefined && { notes }) });
    if (!updated) return res.status(404).json({ error: 'Application not found' });
    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Application not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

export default router;
