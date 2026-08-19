import { DASHBOARD_NOTE_COUNT, DASHBOARD_RECENT_NOTES } from '../../db/query/dashboard.queries.js';

export async function getDashboardSummary(db) {
  const [countRows, recentNotes] = await Promise.all([
    db.query(DASHBOARD_NOTE_COUNT),
    db.query(DASHBOARD_RECENT_NOTES, [5]),
  ]);
  return {
    metrics: {
      notes: Number(countRows[0]?.count ?? 0),
      modules: 3,
      status: 'ready',
    },
    recentNotes,
  };
}
