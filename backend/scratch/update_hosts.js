const fs = require('fs');

const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

try {
  let content = fs.readFileSync(hostsPath, 'utf8');
  if (!content.includes('postgres')) {
    content += '\n127.0.0.1 postgres\n';
    fs.writeFileSync(hostsPath, content, 'utf8');
    console.log('SUCCESSFULLY added "127.0.0.1 postgres" to C:\\Windows\\System32\\drivers\\etc\\hosts!');
  } else {
    console.log('"postgres" is already present in C:\\Windows\\System32\\drivers\\etc\\hosts');
  }
} catch (err) {
  console.error('Error writing to hosts file:', err.message);
}
