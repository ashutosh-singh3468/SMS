import { db, pool } from '../config/db.js';

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    isVerified: row.isVerified,
    verificationToken: row.verificationToken,
  };
}

export async function createUser(user) {
  if (db.mode === 'memory') {
    const created = { id: db.memory.users.length + 1, ...user };
    db.memory.users.push(created);
    return created;
  }

  const query = `
    INSERT INTO users (name, email, password_hash, role, is_verified, verification_token)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, password_hash AS "passwordHash", role,
      is_verified AS "isVerified", verification_token AS "verificationToken";
  `;
  const values = [user.name, user.email, user.passwordHash, user.role, user.isVerified, user.verificationToken];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function findUserByEmail(email) {
  if (db.mode === 'memory') {
    return db.memory.users.find((user) => user.email === email) || null;
  }

  const query = `
    SELECT id, name, email, password_hash AS "passwordHash", role,
      is_verified AS "isVerified", verification_token AS "verificationToken"
    FROM users WHERE email = $1;
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  if (db.mode === 'memory') {
    return db.memory.users.find((user) => user.id === id) || null;
  }

  const query = `
    SELECT id, name, email, password_hash AS "passwordHash", role,
      is_verified AS "isVerified", verification_token AS "verificationToken"
    FROM users WHERE id = $1;
  `;
  const { rows } = await pool.query(query, [id]);
  return mapUser(rows[0]);
}

export async function findUserByVerificationToken(token) {
  if (db.mode === 'memory') {
    return db.memory.users.find((user) => user.verificationToken === token) || null;
  }

  const query = `
    SELECT id, name, email, password_hash AS "passwordHash", role,
      is_verified AS "isVerified", verification_token AS "verificationToken"
    FROM users WHERE verification_token = $1;
  `;
  const { rows } = await pool.query(query, [token]);
  return rows[0] || null;
}

export async function verifyUser(userId) {
  if (db.mode === 'memory') {
    const index = db.memory.users.findIndex((user) => user.id === userId);
    if (index === -1) {
      return null;
    }
    db.memory.users[index] = {
      ...db.memory.users[index],
      isVerified: true,
      verificationToken: null,
    };
    return db.memory.users[index];
  }

  const query = `
    UPDATE users
    SET is_verified = TRUE, verification_token = NULL
    WHERE id = $1
    RETURNING id, name, email, role, is_verified AS "isVerified", verification_token AS "verificationToken";
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}
