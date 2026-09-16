// Rewrite Casks/joxo.rb from the latest published desktop release of JoxoAI/joxo.
// Public data only: the release list and the two .dmg assets, hashed after download.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const headers = { 'User-Agent': 'joxo-tap-sync' };
const releases = await (await fetch('https://api.github.com/repos/JoxoAI/joxo/releases?per_page=20', { headers })).json();
const release = releases.find((r) => !r.draft && !r.prerelease && /^desktop-v\d+\.\d+\.\d+$/.test(r.tag_name));
if (!release) { console.log('No published desktop release yet; nothing to sync.'); process.exit(0); }
const version = release.tag_name.slice('desktop-v'.length);
const sha = async (arch) => {
  const asset = release.assets.find((a) => a.name === `Joxo_${version}_${arch}.dmg`);
  if (!asset) throw new Error(`Release ${release.tag_name} has no Joxo_${version}_${arch}.dmg`);
  const bytes = Buffer.from(await (await fetch(asset.browser_download_url, { headers })).arrayBuffer());
  if (bytes.length < 1_000_000) throw new Error(`${asset.name} is too small to be the installer`);
  return createHash('sha256').update(bytes).digest('hex');
};
const [arm, intel] = await Promise.all([sha('aarch64'), sha('x64')]);
const path = 'Casks/joxo.rb';
const before = readFileSync(path, 'utf8');
const after = before
  .replace(/version "[^"]+"/, `version "${version}"`)
  .replace(/sha256 arm:\s+"[0-9a-f]{64}",\n\s+intel: "[0-9a-f]{64}"/, `sha256 arm:   "${arm}",\n         intel: "${intel}"`);
if (after === before) { console.log(`Cask already at ${version}.`); process.exit(0); }
writeFileSync(path, after);
console.log(`Cask updated to ${version} (arm ${arm.slice(0, 12)}…, intel ${intel.slice(0, 12)}…).`);
