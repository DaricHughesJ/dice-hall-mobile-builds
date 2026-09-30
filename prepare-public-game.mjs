import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const response = await fetch('https://farkle-dice-hall-test.darichughes.chatgpt.site/');
if (!response.ok) throw new Error(`Public game download failed: ${response.status}`);
let html = await response.text();
// Cloudflare adds a browser challenge script to hosted responses. It is not
// part of the game and cannot run from a bundled native origin.
const injectedStart = html.lastIndexOf('<script>');
const injectedEnd = html.indexOf('</script>', injectedStart);
if (injectedStart >= 0 && html.slice(injectedStart, injectedEnd).includes('window.__CF$cv$params=')) {
  html = html.slice(0, injectedStart) + html.slice(injectedEnd + '</script>'.length);
}
const hash = createHash('sha256').update(html).digest('hex');
const expected = '2b698b3c47113cac8ac8f74d60e231e62e82dfcd59bb895d82c3896539a1182f';
if (hash !== expected) throw new Error(`Public game has changed: ${hash}`);
mkdirSync('www', { recursive: true });
writeFileSync('www/index.html', html);
writeFileSync('www/build.json', JSON.stringify({ sha256: hash, source: response.url }, null, 2));
writeFileSync('capacitor.config.json', JSON.stringify({ appId: 'com.darichughes.farkle', appName: 'Farkle Dice Hall', webDir: 'www', backgroundColor: '#102018' }, null, 2));
console.log(`Public game verified: ${hash}`);
