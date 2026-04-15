import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";

export async function getDefaultUser() {
  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: DEFAULT_USER_EMAIL,
      name: "Default Host",
      timezone: "UTC",
    },
  });
}
