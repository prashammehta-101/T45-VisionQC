// Runs a real mongod with durable local files, bound only to localhost.
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const dbPath = resolve('storage/mongodb');
await mkdir(dbPath, { recursive: true });
const server = await MongoMemoryServer.create({ binary: { downloadDir: resolve('storage/mongodb-bin') }, instance: { port: 27017, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger', dbName: 'visionqc' } });
console.log('Development MongoDB listening at ' + server.getUri('visionqc'));
console.log('Data persists in ' + dbPath);
async function stop() { await server.stop({ doCleanup: false }); process.exit(0); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
