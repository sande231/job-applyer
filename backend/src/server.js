import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import resumeRouter from './routes/resume.js';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(join(__dirname, '../data'), { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/parse-resume', resumeRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
