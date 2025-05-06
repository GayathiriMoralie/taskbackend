const bcrypt = require('bcrypt');

async function hashPasswords() {
  const passwords = ['12345', '54321', '67890'];
  for (const pwd of passwords) {
    const hash = await bcrypt.hash(pwd, 10);
    console.log(`Password: ${pwd} => Hash: ${hash}`);
  }
}

hashPasswords();
