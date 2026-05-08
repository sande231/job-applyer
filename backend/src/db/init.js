import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../data/applications.json');

function load() {
  if (!existsSync(DB_PATH)) return { nextId: 1, applications: [] };
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')); } catch { return { nextId: 1, applications: [] }; }
}

function save(store) {
  writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
}

export const db = {
  getAll() {
    const { applications } = load();
    return [...applications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  create(fields) {
    const store = load();
    const app = { id: store.nextId++, created_at: new Date().toISOString(), ...fields };
    store.applications.push(app);
    save(store);
    return app;
  },
  update(id, fields) {
    const store = load();
    const idx = store.applications.findIndex((a) => a.id === Number(id));
    if (idx === -1) return null;
    store.applications[idx] = { ...store.applications[idx], ...fields };
    save(store);
    return store.applications[idx];
  },
  delete(id) {
    const store = load();
    const before = store.applications.length;
    store.applications = store.applications.filter((a) => a.id !== Number(id));
    save(store);
    return store.applications.length < before;
  },
};
