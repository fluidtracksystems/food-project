// Stops the Astro dev/preview server started from THIS repo by `npm run dev` or `npm run preview`.
// Matches processes by command line (this repo's path + astro + dev/preview), not by port, so an
// Astro server from another project that happens to hold port 4321 is never touched.
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const win = process.platform === 'win32';

function run(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

const isAstroServer = (cmdline) =>
  cmdline.toLowerCase().includes(root.toLowerCase()) && /astro/i.test(cmdline) && /\b(dev|preview)\b/.test(cmdline);

function findPids() {
  if (win) {
    const out = run('powershell', [
      '-NoProfile',
      '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { \"$($_.ProcessId)`t$($_.CommandLine)\" }",
    ]);
    return out
      .split(/\r?\n/)
      .map((l) => l.split('\t'))
      .filter(([pid, cmd]) => pid && cmd && Number(pid) !== process.pid && isAstroServer(cmd))
      .map(([pid]) => pid.trim());
  }
  return run('ps', ['-eo', 'pid=,args='])
    .split('\n')
    .map((l) => l.trim().match(/^(\d+)\s+(.*)$/))
    .filter((m) => m && Number(m[1]) !== process.pid && isAstroServer(m[2]))
    .map((m) => m[1]);
}

const pids = findPids();
for (const pid of pids) {
  if (win) run('taskkill', ['/PID', pid, '/T', '/F']);
  else run('kill', [pid]);
  console.log(`Stopped dev server (pid ${pid}).`);
}
if (pids.length === 0) console.log('No dev server from this repo is running.');
