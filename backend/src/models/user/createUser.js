import pool from "../../config/db.js";

export default async function createUser({
  firstname,
  lastname,
  email,
  password,
  number,
  role_id,
  citizenshipFront,
  citizenshipBack,
}) {
  const approvalStatus = "pending";
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
      approvalStatus,
    ]
  );

  return result.rows[0];
}
