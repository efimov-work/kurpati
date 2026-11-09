import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function run(command, args, cwd = root, env = process.env) {
    const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', stdio: 'pipe' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${command} failed`);
    return result.stdout.trim();
}
const env = { ...process.env, NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://efimov-work.github.io', NEXT_PUBLIC_BASE_PATH: '/kurpati', SITE_NOINDEX: process.env.SITE_NOINDEX || '1' };
const built = spawnSync('npm', ['run', 'export'], { cwd: root, env, stdio: 'inherit' });
if (built.error) throw built.error;
if (built.status !== 0) throw new Error('Pages build failed');
const temporary = await mkdtemp(path.join(tmpdir(), 'kurpati-pages-'));
try {
    await cp(path.join(root, 'out'), temporary, { recursive: true });
    run('git', ['init', '-q', '-b', 'gh-pages'], temporary);
    run('git', ['config', 'user.name', run('git', ['config', 'user.name'])], temporary);
    run('git', ['config', 'user.email', run('git', ['config', 'user.email'])], temporary);
    run('git', ['add', '-A'], temporary);
    run('git', ['commit', '-q', '-m', 'Prepare Kurpati static preview'], temporary);
    run('git', ['fetch', temporary, '+gh-pages:refs/heads/gh-pages']);
    console.log('Local gh-pages branch prepared. Nothing has been published.');
} finally { await rm(temporary, { recursive: true, force: true }); }
