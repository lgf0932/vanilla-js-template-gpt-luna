import handler from '../server/adapters/vercel.entry.js';

export const config = { runtime: 'edge' };

export default handler;
