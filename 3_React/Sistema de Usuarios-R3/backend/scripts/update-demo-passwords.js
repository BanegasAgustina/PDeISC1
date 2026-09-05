import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

const accounts = [
  ['admin@petcare.local', process.argv[2]],
  ['veterinaria@petcare.local', process.argv[3]],
];

if (accounts.some(([, password]) => !password || password.length < 8)) {
  console.error('Uso: node scripts/update-demo-passwords.js <password-admin> <password-veterinaria>');
  process.exitCode = 1;
} else {
  try {
    for (const [email, password] of accounts) {
      const passwordHash = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'UPDATE usuarios SET password_hash = ? WHERE email = ?',
        [passwordHash, email],
      );

      if (result.affectedRows !== 1) throw new Error(`No se encontro la cuenta ${email}.`);
      console.log(`Password updated: ${email}`);
    }
  } finally {
    await pool.end();
  }
}
