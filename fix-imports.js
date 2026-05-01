const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if(file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src/pages');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/from\s+["']\.\.\/WebsiteNavbar["']/g, 'from "../../components/WebsiteNavbar"');
  content = content.replace(/from\s+["']\.\.\/Footer["']/g, 'from "../../components/Footer"');
  content = content.replace(/from\s+["']\.\.\/components\//g, 'from "../../components/');
  
  if(content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log('Modified ' + modifiedCount + ' files.');
