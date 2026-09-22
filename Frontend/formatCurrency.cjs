const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./src');
let replaced = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/\.toFixed\(2\)/g, ".toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})");
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    replaced++;
  }
});
console.log('Replaced in ' + replaced + ' files');
