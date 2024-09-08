import Database from 'better-sqlite3';

const db = new Database('data.sqlite');

export function query(sql: string, params: any[] = []) {
  return db.prepare(sql).all(params);
}

export function run(sql: string, params: any[] = []) {
  return db.prepare(sql).run(params);
}

export { db };