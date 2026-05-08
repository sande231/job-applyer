import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, 'app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS saved_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_data TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

export const resumeDb = {
  save(data) {
    db.prepare('DELETE FROM resumes').run();
    db.prepare('INSERT INTO resumes (id, data, created_at) VALUES (1, ?, ?)').run(
      JSON.stringify(data),
      new Date().toISOString()
    );
  },
  get() {
    const row = db.prepare('SELECT data FROM resumes WHERE id = 1').get();
    return row ? JSON.parse(row.data) : null;
  },
};

export const savedJobsDb = {
  getAll() {
    return db
      .prepare('SELECT id, job_data, created_at FROM saved_jobs ORDER BY created_at DESC')
      .all()
      .map((row) => ({ id: row.id, ...JSON.parse(row.job_data), savedAt: row.created_at }));
  },
  save(jobData) {
    const result = db
      .prepare('INSERT INTO saved_jobs (job_data, created_at) VALUES (?, ?)')
      .run(JSON.stringify(jobData), new Date().toISOString());
    return { id: result.lastInsertRowid, ...jobData };
  },
  delete(id) {
    return db.prepare('DELETE FROM saved_jobs WHERE id = ?').run(Number(id)).changes > 0;
  },
};
