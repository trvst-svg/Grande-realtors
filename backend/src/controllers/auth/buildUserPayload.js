export default function buildUserPayload(user, roleName) {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    number: user.number,
    role_id: user.role_id,
    role: roleName || null,
    citizenship_front: user.citizenship_front,
    citizenship_back: user.citizenship_back,
    approval_status: user.approval_status,
  };
}
