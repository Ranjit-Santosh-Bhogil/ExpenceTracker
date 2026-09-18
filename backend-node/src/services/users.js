import prisma from '../db.js';
import { hashPassword } from '../auth/password.js';

export async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser({ name, email, password }) {
  return prisma.user.create({
    data: {
      name,
      email,
      hashedPassword: hashPassword(password),
    },
  });
}
