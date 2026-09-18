import bcrypt from 'bcrypt';

/**
 * Truncate password to 72 bytes to match Python backend behavior.
 */
function truncatePassword(password) {
  return Buffer.from(password, 'utf-8').subarray(0, 72).toString('utf-8');
}

export function hashPassword(password) {
  return bcrypt.hashSync(truncatePassword(password), bcrypt.genSaltSync());
}

export function verifyPassword(plainPassword, hashedPassword) {
  try {
    return bcrypt.compareSync(truncatePassword(plainPassword), hashedPassword);
  } catch {
    return false;
  }
}
