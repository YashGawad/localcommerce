const bcrypt = require('bcryptjs');
const pool = require('../config/db');
require('dotenv').config();

/**
 * Development utility script:
 * Replaces placeholder 'DEV_SEED_HASH_REPLACE_LATER' with valid bcrypt hashes
 * using the DEV_SEED_PASSWORD environment variable.
 */
async function seedDevelopmentPasswords() {
  const seedPassword = process.env.DEV_SEED_PASSWORD || 'DevPassword@123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(seedPassword, saltRounds);

  console.log('Generating bcrypt hash for seed accounts...');

  try {
    const result = await pool.query(
      `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE password_hash = 'DEV_SEED_HASH_REPLACE_LATER'
      RETURNING id, email, role;
      `,
      [hash]
    );

    console.log(`Successfully updated ${result.rowCount} seed user account(s):`);
    result.rows.forEach((user) => {
      console.log(`- ${user.email} (${user.role})`);
    });
  } catch (error) {
    console.error('Error updating seed user password hashes:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDevelopmentPasswords();
}

module.exports = seedDevelopmentPasswords;
