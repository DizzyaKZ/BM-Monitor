const fs = require('fs');
const path = require('path');
const b = fs.existsSync('dist/bm-monitor/browser') ? 'dist/bm-monitor/browser' : 'dist/bm-monitor';
if (fs.existsSync(b)) {
  fs.readdirSync(b).forEach(f => {
    const s = path.join(b, f);
    if (fs.statSync(s).isFile()) fs.copyFileSync(s, f);
  });
  console.log('✔ Скомпилированные файлы успешно скопированы в корень для Plesk');
}
