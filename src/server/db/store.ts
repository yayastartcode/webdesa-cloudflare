import { and, asc, desc, eq, ne, gt, gte, lt, lte, sql, getTableColumns, type SQL, type InferSelectModel } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { SQLiteTable, SQLiteColumn, SQLiteInsertValue, SQLiteUpdateSetSource } from 'drizzle-orm/sqlite-core';
import * as schema from './schema';

export const createDb = (binding: D1Database) => drizzle(binding, { schema });
export type Database = ReturnType<typeof createDb>;
type Filter = Record<string, unknown>;
type Query = {
  where?: Filter; orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  skip?: number; take?: number; select?: Record<string, boolean>; distinct?: string[];
  include?: { author?: { select: Record<string, boolean> }; navigationItems?: Query };
};
type Relations = {
  author?: { name: string; email: string } | null;
  navigationItems?: typeof schema.navigationItem.$inferSelect[];
};

// A small Drizzle repository keeps existing API contracts while replacing Prisma.
// It supports only the operations used by this application, with bound SQL values.
function repository<T extends SQLiteTable>(db: Database, table: T) {
  type Row = InferSelectModel<T> & Relations;
  const columns: Record<string, SQLiteColumn> = getTableColumns(table);
  function column(name: string) {
    const result = columns[name];
    if (!result) throw new Error(`Unknown column: ${name}`);
    return result;
  }
  function predicate(where: Filter = {}): SQL | undefined {
    const parts: SQL[] = [];
    for (const [key, value] of Object.entries(where)) {
      if (value === undefined) continue;
      const col = column(key);
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        for (const [operator, operand] of Object.entries(value)) {
          const compare = { not: ne, gt, gte, lt, lte }[operator];
          if (!compare) throw new Error(`Unsupported operator: ${operator}`);
          parts.push(compare(col, operand));
        }
      } else parts.push(value === null ? sql`${col} is null` : eq(col, value));
    }
    return and(...parts);
  }
  async function findMany(query: Query = {}): Promise<Row[]> {
    let statement = db.select().from(table).where(predicate(query.where)).$dynamic();
    if (query.orderBy) {
      const order = Array.isArray(query.orderBy) ? query.orderBy : [query.orderBy];
      statement = statement.orderBy(...order.flatMap(item => Object.entries(item).map(([key, direction]) => direction === 'asc' ? asc(column(key)) : desc(column(key)))));
    }
    if (query.take !== undefined) {
      if (!Number.isSafeInteger(query.take) || query.take < 1 || query.take > 100) throw new Error('Invalid limit');
      statement = statement.limit(query.take);
    }
    if (query.skip !== undefined) {
      if (!Number.isSafeInteger(query.skip) || query.skip < 0) throw new Error('Invalid offset');
      statement = statement.offset(query.skip);
    }
    let rows = await statement as Row[];
    if (query.distinct) {
      const seen = new Set<string>();
      rows = rows.filter(row => {
        const key = JSON.stringify(query.distinct!.map(field => row[field]));
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
    }
    for (const row of rows) {
      if (query.include?.author && 'authorId' in row) {
        const [author] = await db.select({ name: schema.user.name, email: schema.user.email }).from(schema.user).where(eq(schema.user.id, String(row.authorId)));
        row.author = author ?? null;
      }
      if (query.include?.navigationItems) {
        row.navigationItems = await repository(db, schema.navigationItem).findMany({ ...query.include.navigationItems, where: { ...query.include.navigationItems.where, headerSettingsId: row.id } });
      }
    }
    return rows;
  }
  async function findFirst(query: Query = {}) { return (await findMany({ ...query, take: 1 }))[0] ?? null; }
  function values(data: Record<string, unknown>) {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => {
      const col = column(key);
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        if ('increment' in value) return [key, sql`${col} + ${value.increment}`];
        if ('decrement' in value) return [key, sql`${col} - ${value.decrement}`];
        throw new Error('Invalid update value');
      }
      return [key, value];
    }));
  }
  return {
    findMany, findFirst, findUnique: findFirst,
    async count(query: Query = {}) {
      const [result] = await db.select({ count: sql<number>`count(*)` }).from(table).where(predicate(query.where));
      return result.count;
    },
    async create({ data, ...query }: Query & { data: Record<string, unknown> }): Promise<Row> {
      const [row] = await db.insert(table).values(values(data) as SQLiteInsertValue<T>).returning();
      return (await findFirst({ ...query, where: { id: row.id } }))!;
    },
    async createMany({ data }: { data: Record<string, unknown>[] }) {
      if (data.length) await db.insert(table).values(data.map(item => values(item) as SQLiteInsertValue<T>));
    },
    async update({ data, ...query }: Query & { data: Record<string, unknown> }): Promise<Row> {
      const [row] = await db.update(table).set(values(data) as SQLiteUpdateSetSource<T>).where(predicate(query.where)).returning();
      if (!row) throw new Error('Record not found');
      return (await findFirst({ ...query, where: { id: row.id } }))!;
    },
    async updateMany({ data, where }: { data: Record<string, unknown>; where: Filter }) {
      await db.update(table).set(values(data) as SQLiteUpdateSetSource<T>).where(predicate(where));
    },
    async delete({ where }: Query) { await db.delete(table).where(predicate(where)); },
    async deleteMany({ where }: Query) { await db.delete(table).where(predicate(where)); },
  };
}
export function createStore(db: Database) {
  return {
    user: repository(db, schema.user), post: repository(db, schema.post),
    headerSettings: repository(db, schema.headerSettings), navigationItem: repository(db, schema.navigationItem),
    heroSlide: repository(db, schema.heroSlide), villageInfo: repository(db, schema.villageInfo),
    villageHeadWelcome: repository(db, schema.villageHeadWelcome), populationData: repository(db, schema.populationData),
    employee: repository(db, schema.employee), helpdesk: repository(db, schema.helpdesk),
    info: repository(db, schema.info), gallery: repository(db, schema.gallery), apbDesa: repository(db, schema.apbDesa),
  };
}
