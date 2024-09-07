import { initializeDatabase } from '$lib/db';

initializeDatabase();

export async function handle({ event, resolve }) {
  return resolve(event);
}