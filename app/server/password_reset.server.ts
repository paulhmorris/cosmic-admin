import type { PasswordReset, User } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "~/server/db.server";

export function getPasswordResetByToken({ token }: { token: PasswordReset["token"] }) {
  return prisma.passwordReset.findUnique({
    where: { token },
    select: { expiresAt: true, userId: true },
  });
}

export function getCurrentPasswordReset({ userId }: { userId: User["id"] }) {
  return prisma.passwordReset.findFirst({
    where: { userId, expiresAt: { gte: new Date() } },
    select: { id: true },
  });
}

export function expirePasswordReset({ token }: { token: PasswordReset["token"] }) {
  return prisma.passwordReset.updateMany({
    where: { token },
    data: { expiresAt: new Date(0), usedAt: new Date() },
  });
}

export function generatePasswordReset({ email }: { email: User["email"] }) {
  return prisma.passwordReset.create({
    data: {
      expiresAt: dayjs().add(15, "minute").toDate(),
      user: { connect: { email } },
    },
  });
}

export function deletePasswordReset({ token }: { token: PasswordReset["token"] }) {
  return prisma.passwordReset.delete({ where: { token } });
}
