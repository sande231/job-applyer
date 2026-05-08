import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../data/users.json');

function load() {
  if (!existsSync(DB_PATH)) return { nextId: 1, users: [] };
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')); } catch { return { nextId: 1, users: [] }; }
}

function save(store) {
  writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
}

export const usersDb = {
  findByEmail(email) {
    const { users } = load();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  findById(id) {
    const { users } = load();
    return users.find((u) => u.id === Number(id)) || null;
  },
  create(fields) {
    const store = load();
    if (store.users.some((u) => u.email.toLowerCase() === fields.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const user = { id: store.nextId++, created_at: new Date().toISOString(), ...fields };
    store.users.push(user);
    save(store);
    return user;
  },
};
