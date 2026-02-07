import pool from "../config/db.js";

export async function getRoleIdByName(name) {
  const result = await pool.query("SELECT id FROM roles WHERE name = $1", [
    name,
  ]);
  return result.rows[0]?.id || null;
}

export async function findUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}

export async function findUserByNumber(number) {
  const result = await pool.query("SELECT * FROM users WHERE number = $1", [
    number,
  ]);
  return result.rows[0];
}

export async function getUserById(userId) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0];
}

export async function createUser({
  firstname,
  lastname,
  email,
  password,
  number,
  role_id,
  citizenshipFront,
  citizenshipBack,
  approval_status = "pending",
}) {
  const result = await pool.query(
    `INSERT INTO users
      (firstname, lastname, email, password, number, role_id, citizenship_front, citizenship_back, approval_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, firstname, lastname, email, number, citizenship_front, citizenship_back, approval_status`,
    [
      firstname,
      lastname,
      email,
      password,
      number,
      role_id,
      citizenshipFront,
      citizenshipBack,
      approval_status,
    ]
  );

  return result.rows[0];
}

export async function listPendingUsers() {
  const result = await pool.query(
    `SELECT id, firstname, lastname, email, number, created_at,
            citizenship_front, citizenship_back, approval_status
     FROM users
     WHERE approval_status = 'pending'
     ORDER BY created_at ASC`
  );
  return result.rows;
}

export async function approveUser(userId, reviewedBy = null) {
  const result = await pool.query(
    `UPDATE users
     SET approval_status = 'approved',
         approval_reason = NULL,
         approved_at = NOW(),
         rejected_at = NULL,
         reviewed_by = $2
     WHERE id = $1
     RETURNING id, firstname, lastname, email, approval_status`,
    [userId, reviewedBy]
  );
  return result.rows[0];
}

export async function rejectUser(userId, reason, reviewedBy = null) {
  const result = await pool.query(
    `UPDATE users
     SET approval_status = 'rejected',
         approval_reason = $2,
         rejected_at = NOW(),
         approved_at = NULL,
         reviewed_by = $3
     WHERE id = $1
     RETURNING id, firstname, lastname, email, approval_status, approval_reason`,
    [userId, reason, reviewedBy]
  );
  return result.rows[0];
}

export async function getUserProfile(userId) {
  const user = await pool.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.number, u.created_at,
            r.name AS role, u.citizenship_front, u.citizenship_back
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [userId]
  );
  if (!user.rows[0]) return null;

  const stats = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM properties WHERE owner_id = $1) AS properties,
      (SELECT COUNT(*) FROM favorites WHERE user_id = $1) AS favorites,
      (SELECT COUNT(*) FROM bids WHERE user_id = $1) AS bids`,
    [userId]
  );

  const myProperties = await pool.query(
    `SELECT p.id, p.location, p.price, pt.name AS property_type
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE p.owner_id = $1
     ORDER BY p.listed_date DESC
     LIMIT 4`,
    [userId]
  );

  return {
    user: user.rows[0],
    stats: stats.rows[0],
    myProperties: myProperties.rows,
  };
}
