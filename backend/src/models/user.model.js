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

export async function createUser({
  firstname,
  lastname,
  email,
  password,
  number,
  role_id,
  citizenshipFront,
  citizenshipBack,
}) {
  const result = await pool.query(
    `INSERT INTO users
      (firstname, lastname, email, password, number, role_id, citizenship_front, citizenship_back)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, firstname, lastname, email, number, citizenship_front, citizenship_back`,
    [
      firstname,
      lastname,
      email,
      password,
      number,
      role_id,
      citizenshipFront,
      citizenshipBack,
    ]
  );

  return result.rows[0];
}
