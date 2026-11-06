import { describe, expect, it } from 'vitest';
import { convertSnapshot, toCents } from '../../scripts/convert-postgres.mjs';
import { legacyTables } from '../../scripts/legacy-tables.mjs';

const empty = () => Object.fromEntries(Object.keys(legacyTables).map(table => [table, []]));
const date = '2026-01-01T00:00:00.000Z';
describe('PostgreSQL to D1 data conversion', () => {
  it('preserves exact APB cents including maximum Decimal(15,2) values', () => {
    expect(toCents('9999999999999.99')).toBe(999999999999999);
    expect(toCents('123456789.12')).toBe(12345678912);
    expect(toCents('0')).toBe(0);
    expect(() => toCents('1.001')).toThrow();
    expect(() => toCents('NaN')).toThrow();
  });
  it('preserves user IDs, bcrypt credentials, names, roles, dates and escaped text', () => {
    const snapshot = empty();
    snapshot.users = [{ id: 'legacy-id', name: "O'Connor", email: 'Admin@Example.test', emailVerified: null, image: null, password: '$2b$12$' + 'a'.repeat(53), role: 'ADMIN', createdAt: date, updatedAt: date }];
    const sql = convertSnapshot(snapshot);
    expect(sql).toContain("'legacy-id'"); expect(sql).toContain("'O''Connor'");
    expect(sql).toContain('1767225600000'); expect(sql).toContain('"accounts"');
    expect(sql).toContain("'credential'"); expect(sql).toContain('"setup_lock"');
    expect(sql).not.toContain('INSERT INTO "sessions"');
  });
  it('fails closed on incomplete snapshots and unknown columns', () => {
    expect(() => convertSnapshot({})).toThrow('Missing table array');
    const snapshot = empty(); snapshot.gallery = [{ injected: 'unexpected' }];
    expect(() => convertSnapshot(snapshot)).toThrow('Unexpected column');
  });
});
