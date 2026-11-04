// Rewrite Formula/joxo-cli.rb from the latest published connector release of JoxoAI/joxo
// (tag connector-v<version>). Public data only: the release list and its binary-manifest.json,
// which already carries the SHA-256 of each gzipped executable, so nothing is downloaded and hashed here.
import { createPublicKey, verify } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const headers = { 'User-Agent': 'joxo-tap-sync' };
const releases = await (await fetch('https://api.github.com/repos/JoxoAI/joxo/releases?per_page=100', { headers })).json();
// The highest version wins, not the first one the API lists (a re-published or back-dated older release can sort first).
const semver = (tag) => tag.slice('connector-v'.length).split('.').map(Number);
const compare = (a, b) => { for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
const release = releases
  .filter((r) => !r.draft && !r.prerelease && /^connector-v\d+\.\d+\.\d+$/.test(r.tag_name))
  .sort((a, b) => compare(semver(b.tag_name), semver(a.tag_name)))[0];
if (!release) { console.log('No published connector release yet; nothing to sync.'); process.exit(0); }
const version = release.tag_name.slice('connector-v'.length);
const asset = release.assets.find((a) => a.name === 'binary-manifest.json');
if (!asset) throw new Error(`Release ${release.tag_name} has no binary-manifest.json`);
// The manifest must carry Joxo's detached Ed25519 signature (the key the connector trusts), so a release
// asset someone swapped cannot move the formula's checksums.
const MANIFEST_PUBLIC_KEY = 'MCowBQYDK2VwAyEAFICt4ZV8GKx1KmxpSqgwKf1go7l47efjAQpTTllL6Sg=';
const sigAsset = release.assets.find((a) => a.name === 'binary-manifest.json.sig');
if (!sigAsset) throw new Error(`Release ${release.tag_name} has no binary-manifest.json.sig`);
const manifestText = await (await fetch(asset.browser_download_url, { headers })).text();
const signature = Buffer.from((await (await fetch(sigAsset.browser_download_url, { headers })).text()).trim(), 'base64');
const publicKey = createPublicKey({ key: Buffer.from(MANIFEST_PUBLIC_KEY, 'base64'), format: 'der', type: 'spki' });
if (signature.length !== 64 || !verify(null, Buffer.from(manifestText, 'utf8'), publicKey, signature)) throw new Error(`The signature of ${release.tag_name}'s binary-manifest.json is not valid.`);
const manifest = JSON.parse(manifestText);
for (const target of ['darwin-arm64', 'darwin-x64']) {
  if (manifest.targets?.[target]?.signed !== 'developer-id') throw new Error(`${target} in ${release.tag_name} is not Developer ID signed; not syncing it.`);
}
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
