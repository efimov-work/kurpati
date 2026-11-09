import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const standalone = path.join(root, '.next/standalone');
await mkdir(path.join(standalone, '.next'), { recursive: true });
await cp(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true });
await cp(path.join(root, '.next/static'), path.join(standalone, '.next/static'), { recursive: true });
const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: root, stdio: 'inherit', env: { ...process.env, PORT: process.env.PORT || '3010', HOSTNAME: process.env.KURPATI_HOST || '127.0.0.1' } });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', code => { process.exitCode = code || 0; });
