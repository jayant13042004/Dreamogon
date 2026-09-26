const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
const tempHtml = path.join(__dirname, 'temp_brand_render.html');

// 1. Create the HTML rendering template with exact vector geometry & Cinzel typography
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Cinzel', serif;
    background: #000;
  }

  /* LOGO DARK (800x200) */
  #logo-dark {
    width: 800px;
    height: 200px;
    background: #101013;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
  }

  /* LOGO LIGHT (800x200) */
  #logo-light {
    width: 800px;
    height: 200px;
    background: #F6F4EF;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
  }

  /* FAVICON & APP ICON (512x512) */
  #app-icon {
    width: 512px;
    height: 512px;
    background: #101013;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* OG SOCIAL CARD (1200x630) */
  #og-card {
    width: 1200px;
    height: 630px;
    background: radial-gradient(circle at 50% 35%, #18171d 0%, #0c0b0e 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 1px solid #232229;
  }

  .brand-text-dark {
    font-family: 'Cinzel', serif;
    font-size: 54px;
    font-weight: 600;
    letter-spacing: 0.38em;
    text-indent: 0.38em;
    color: #EBDDC6;
    line-height: 1;
  }

  .brand-text-light {
    font-family: 'Cinzel', serif;
    font-size: 54px;
    font-weight: 600;
    letter-spacing: 0.38em;
    text-indent: 0.38em;
    color: #171513;
    line-height: 1;
  }

  .og-title {
    font-family: 'Cinzel', serif;
    font-size: 64px;
    font-weight: 600;
    letter-spacing: 0.34em;
    text-indent: 0.34em;
    color: #F3EBDD;
    margin-top: 36px;
    line-height: 1;
  }

  .og-tagline {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 22px;
    font-weight: 300;
    letter-spacing: 0.05em;
    color: #9E998E;
    margin-top: 24px;
    max-width: 800px;
    text-align: center;
    line-height: 1.5;
  }

  .og-badge {
    margin-top: 32px;
    padding: 8px 22px;
    border-radius: 9999px;
    border: 1px solid #2F2D36;
    background: rgba(255,255,255,0.03);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #C5B38F;
  }
</style>
</head>
<body>

<!-- 1. LOGO DARK -->
<div id="logo-dark">
  <!-- SUBCONSCIOUS LOG FACETED THRESHOLD EMBLEM (Warm Champagne Gold) -->
  <svg width="80" height="96" viewBox="0 0 100 120" fill="none">
    <!-- Outer Faceted Sanctuary Polygon / Portal -->
    <path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#C5B38F" stroke-width="7" stroke-linejoin="round" />
    <!-- Inner Portal Threshold Steps / Monolith -->
    <path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#C5B38F" />
    <!-- Center Splay of Light -->
    <rect x="46" y="52" width="8" height="40" fill="#101013" />
  </svg>
  <span class="brand-text-dark">SUBCONSCIOUS LOG</span>
</div>

<!-- 2. LOGO LIGHT -->
<div id="logo-light">
  <svg width="80" height="96" viewBox="0 0 100 120" fill="none">
    <path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#171513" stroke-width="7" stroke-linejoin="round" />
    <path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#171513" />
    <rect x="46" y="52" width="8" height="40" fill="#F6F4EF" />
  </svg>
  <span class="brand-text-light">SUBCONSCIOUS LOG</span>
</div>

<!-- 3. APP ICON & FAVICON -->
<div id="app-icon">
  <svg width="340" height="408" viewBox="0 0 100 120" fill="none">
    <path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#C5B38F" stroke-width="7" stroke-linejoin="round" />
    <path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#C5B38F" />
    <rect x="46" y="52" width="8" height="40" fill="#101013" />
  </svg>
</div>

<!-- 4. OG SOCIAL CARD -->
<div id="og-card">
  <svg width="120" height="144" viewBox="0 0 100 120" fill="none">
    <path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#C5B38F" stroke-width="6" stroke-linejoin="round" />
    <path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#C5B38F" />
    <rect x="46" y="52" width="8" height="40" fill="#0c0b0e" />
  </svg>
  <div class="og-title">SUBCONSCIOUS LOG</div>
  <div class="og-tagline">A private place to record your dreams and discover what keeps returning.</div>
  <div class="og-badge">Private Dream Journal & AI Pattern Discovery</div>
</div>

</body>
</html>
`;

fs.writeFileSync(tempHtml, htmlContent, 'utf8');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function renderSnippet(urlHash, outputPath, width, height) {
  const fileUrl = 'file:///' + tempHtml.replace(/\\/g, '/');
  // We can render the entire page or clip it
  const cmd = `"${edgePath}" --headless=new --window-size=${width},${height} --virtual-time-budget=2500 --screenshot="${outputPath}" "${fileUrl}"`;
  execSync(cmd, { stdio: 'inherit' });
}

console.log('Rendering brand assets...');

// We will render dedicated single-element HTML files for exact pixel crops
const elements = [
  {
    name: 'logo-dark.png',
    width: 800,
    height: 200,
    html: `<!DOCTYPE html><html><head><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{width:800px;height:200px;background:#101013;display:flex;align-items:center;justify-content:center;gap:32px;font-family:'Cinzel',serif;overflow:hidden;}.text{font-size:52px;font-weight:600;letter-spacing:0.38em;text-indent:0.38em;color:#EBDDC6;line-height:1;}</style></head><body><svg width="74" height="88" viewBox="0 0 100 120" fill="none"><path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#C5B38F" stroke-width="7" stroke-linejoin="round" /><path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#C5B38F" /><rect x="46" y="52" width="8" height="40" fill="#101013" /></svg><span class="text">SUBCONSCIOUS LOG</span></body></html>`
  },
  {
    name: 'logo-light.png',
    width: 800,
    height: 200,
    html: `<!DOCTYPE html><html><head><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{width:800px;height:200px;background:#F6F4EF;display:flex;align-items:center;justify-content:center;gap:32px;font-family:'Cinzel',serif;overflow:hidden;}.text{font-size:52px;font-weight:600;letter-spacing:0.38em;text-indent:0.38em;color:#171513;line-height:1;}</style></head><body><svg width="74" height="88" viewBox="0 0 100 120" fill="none"><path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#171513" stroke-width="7" stroke-linejoin="round" /><path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#171513" /><rect x="46" y="52" width="8" height="40" fill="#F6F4EF" /></svg><span class="text">SUBCONSCIOUS LOG</span></body></html>`
  },
  {
    name: 'apple-touch-icon.png',
    width: 512,
    height: 512,
    html: `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}body{width:512px;height:512px;background:#101013;display:flex;align-items:center;justify-content:center;overflow:hidden;}</style></head><body><svg width="340" height="408" viewBox="0 0 100 120" fill="none"><path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#C5B38F" stroke-width="7" stroke-linejoin="round" /><path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#C5B38F" /><rect x="46" y="52" width="8" height="40" fill="#101013" /></svg></body></html>`
  },
  {
    name: 'favicon.png',
    width: 128,
    height: 128,
    html: `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}body{width:128px;height:128px;background:#101013;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:24px;}</style></head><body><svg width="86" height="103" viewBox="0 0 100 120" fill="none"><path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#C5B38F" stroke-width="8" stroke-linejoin="round" /><path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#C5B38F" /><rect x="46" y="52" width="8" height="40" fill="#101013" /></svg></body></html>`
  },
  {
    name: 'og-subconsciouslog.png',
    width: 1200,
    height: 630,
    html: `<!DOCTYPE html><html><head><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{width:1200px;height:630px;background:radial-gradient(circle at 50% 32%, #1a1921 0%, #0d0c10 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;border:1px solid #232229;font-family:'Cinzel',serif;}.title{font-size:62px;font-weight:600;letter-spacing:0.34em;text-indent:0.34em;color:#F3EBDD;margin-top:36px;line-height:1;}.desc{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:22px;font-weight:300;letter-spacing:0.04em;color:#A6A196;margin-top:22px;max-width:820px;text-align:center;line-height:1.5;}.pill{margin-top:32px;padding:8px 24px;border-radius:9999px;border:1px solid #33313D;background:rgba(255,255,255,0.03);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#C5B38F;}</style></head><body><svg width="110" height="132" viewBox="0 0 100 120" fill="none"><path d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z" stroke="#C5B38F" stroke-width="6" stroke-linejoin="round" /><path d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z" fill="#C5B38F" /><rect x="46" y="52" width="8" height="40" fill="#0d0c10" /></svg><div class="title">SUBCONSCIOUS LOG</div><div class="desc">A private place to record your dreams and discover what keeps returning.</div><div class="pill">Private Dream Journal & AI Pattern Discovery</div></body></html>`
  }
];

elements.forEach((item) => {
  const tmpPath = path.join(__dirname, `temp_${item.name}.html`);
  const targetPath = path.join(publicDir, item.name);
  fs.writeFileSync(tmpPath, item.html, 'utf8');

  const fileUrl = 'file:///' + tmpPath.replace(/\\/g, '/');
  const cmd = `"${edgePath}" --headless=new --window-size=${item.width},${item.height} --virtual-time-budget=2000 --screenshot="${targetPath}" "${fileUrl}"`;
  console.log(`Rendering ${item.name} (${item.width}x${item.height})...`);
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✓ Generated ${item.name}`);
  } catch (err) {
    console.error(`Error generating ${item.name}:`, err.message);
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
});

// Also copy logo-dark.png to logo.png and favicon.png to favicon.ico
fs.copyFileSync(path.join(publicDir, 'logo-dark.png'), path.join(publicDir, 'logo.png'));
fs.copyFileSync(path.join(publicDir, 'favicon.png'), path.join(publicDir, 'favicon.ico'));

if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);

console.log('All brand assets successfully generated!');
