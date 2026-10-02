import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
const config = ['PORT=3000', 'MONGODB_URI=mongodb://127.0.0.1:27017/visionqc', 'AI_SERVICE_URL=http://127.0.0.1:8000', 'SUPERVISOR_TOKEN=' + randomBytes(32).toString('hex'), 'INSPECTION_TIMEZONE=Asia/Kolkata', ''].join('\n');
try { await writeFile('.env', config, { flag: 'wx' }); console.log('Created private Backend/.env. Use its SUPERVISOR_TOKEN in the threshold control.'); }
catch (error) { if (error.code === 'EEXIST') console.log('Existing .env preserved.'); else throw error; }
