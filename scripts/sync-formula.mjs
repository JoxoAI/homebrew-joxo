// Rewrite Formula/joxo-cli.rb from the latest published connector release of JoxoAI/joxo
// (tag connector-v<version>). Public data only: the release list and its binary-manifest.json,
// which already carries the SHA-256 of each gzipped executable, so nothing is downloaded and hashed here.
import { readFileSync, writeFileSync } from 'node:fs';

const headers = { 'User-Agent': 'joxo-tap-sync' };
const releases = await (await fetch('https://api.github.com/repos/JoxoAI/joxo/releases?per_page=30', { headers })).json();
const release = releases.find((r) => !r.draft && !r.prerelease && /^connector-v\d+\.\d+\.\d+$/.test(r.tag_name));
if (!release) { console.log('No published connector release yet; nothing to sync.'); process.exit(0); }
const version = release.tag_name.slice('connector-v'.length);
const asset = release.assets.find((a) => a.name === 'binary-manifest.json');
if (!asset) throw new Error(`Release ${release.tag_name} has no binary-manifest.json`);
const manifest = await (await fetch(asset.browser_download_url, { headers })).json();
if (manifest.format !== 1 || manifest.version !== version) throw new Error(`binary-manifest.json is not for ${version}`);
const digest = (target) => {
  const entry = manifest.targets?.[target];
  if (!entry || !/^[0-9a-f]{64}$/.test(entry.asset_sha256 ?? '') || entry.encoding !== 'gzip') throw new Error(`The manifest has no gzipped ${target} build`);
  return entry.asset_sha256;
};
const sha = { 'darwin-arm64': digest('darwin-arm64'), 'darwin-x64': digest('darwin-x64'), 'linux-arm64': digest('linux-arm64'), 'linux-x64': digest('linux-x64') };
const path = 'Formula/joxo-cli.rb';
const before = readFileSync(path, 'utf8');
let after = before.replace(/^  version "[^"]+"/m, `  version "${version}"`);
for (const [target, value] of Object.entries(sha)) {
  after = after.replace(new RegExp(`(joxo-${target}\\.gz"\\n\\s+sha256 ")[0-9a-f]{64}(")`), `$1${value}$2`);
}
if (after === before) { console.log(`Formula already at ${version}.`); process.exit(0); }
writeFileSync(path, after);
console.log(`Formula updated to ${version}.`);
