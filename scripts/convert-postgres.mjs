import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { legacyTables } from './legacy-tables.mjs';

const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const identifier = value => '"' + value.replaceAll('"', '""') + '"';
export function toCents(value) {
  if (!/^\d{1,13}(\.\d{1,2})?$/.test(String(value))) throw new Error('Amount must be a nonnegative decimal with at most 13 integer digits and 2 decimal places');
  const [whole, fraction = ''] = String(value).split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Amount exceeds safe integer range');
  return Number(cents);
}
export function convertSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('Expected a snapshot object');
  const statements = ['-- Import into an empty D1 database after schema migrations.', 'PRAGMA foreign_keys = ON;'];
  const insert = (table, row) => statements.push(`INSERT INTO ${identifier(table)} (${Object.keys(row).map(identifier).join(', ')}) VALUES (${Object.values(row).map(value => value === null ? 'NULL' : typeof value === 'number' ? value : quote(value)).join(', ')});`);
  for (const [table, fields] of Object.entries(legacyTables)) {
    const rows = snapshot[table];
    if (!Array.isArray(rows)) throw new Error(`Missing table array: ${table}`);
    for (const original of rows) {
      if (!original || typeof original !== 'object') throw new Error(`Invalid row: ${table}`);
      for (const key of Object.keys(original)) if (!(key in fields)) throw new Error(`Unexpected column: ${table}.${key}`);
      const row = {};
      for (const [key, type] of Object.entries(fields)) {
        if (table === 'users' && key === 'password') continue;
        let value = original[key];
        if (table === 'users' && key === 'name' && !value) value = original.email;
        if (table === 'users' && key === 'emailVerified') value = Boolean(value);
        if (value === null || value === undefined) {
          if (!type.endsWith('?')) throw new Error(`Missing required value: ${table}.${key}`);
          row[key] = null; continue;
        }
        if (type.startsWith('DateTime') && !(table === 'users' && key === 'emailVerified')) {
          const time = Date.parse(value); if (!Number.isFinite(time)) throw new Error(`Invalid date: ${table}.${key}`); row[key] = time;
        } else if (type === 'Boolean' || (table === 'users' && key === 'emailVerified')) {
          if (typeof value !== 'boolean') throw new Error(`Invalid boolean: ${table}.${key}`); row[key] = value ? 1 : 0;
        } else if (type === 'Decimal') row[key] = toCents(value);
        else if (type === 'Int') { if (!Number.isSafeInteger(value)) throw new Error(`Invalid integer: ${table}.${key}`); row[key] = value; }
        else { if (typeof value !== 'string') throw new Error(`Invalid text: ${table}.${key}`); row[key] = value; }
      }
      if (table === 'users') {
        if (!['USER','ADMIN'].includes(row.role)) throw new Error('Invalid user role');
        row.email = row.email.toLowerCase().trim();
      }
      insert(table, row);
      if (table === 'users' && original.password) {
        if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(original.password)) throw new Error('Unsupported legacy password hash');
        insert('accounts', { id: `legacy-credential-${row.id}`, accountId: row.id, providerId: 'credential', userId: row.id, password: original.password, createdAt: row.createdAt, updatedAt: row.updatedAt });
      }
    }
  }
  if (snapshot.users.some(user => user.role === 'ADMIN')) insert('setup_lock', { id: 1 });
  return statements.join('\n') + '\n';
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , source, destination] = process.argv;
  if (!source || !destination) throw new Error('Usage: node scripts/convert-postgres.mjs <snapshot.json> <import.sql>');
  await writeFile(destination, convertSnapshot(JSON.parse(await readFile(source, 'utf8'))), { mode: 0o600, flag: 'wx' });
  console.log('D1 import SQL created. Source data and password hashes were not printed.');
}
