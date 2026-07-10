const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Replace bg-card with bg-white dark:bg-slate-900 in lines containing 'relative w-full max-w-'
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('relative w-full max-w-') && lines[i].includes('bg-card')) {
          lines[i] = lines[i].replace('bg-card', 'bg-white dark:bg-slate-900');
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

findAndReplace(directoryPath);
