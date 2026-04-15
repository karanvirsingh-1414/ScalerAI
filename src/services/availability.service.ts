import { prisma } from "@/lib/prisma";
import { availabilitySchema } from "@/lib/validators";
import { getDefaultUser } from "./user.service";

export async function getAvailability() {
  const user = await getDefaultUser();
  return prisma.availability.findMany({
    where: { userId: user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function saveAvailability(input: unknown) {
  const payload = availabilitySchema.parse(input);
  const user = await getDefaultUser();

  return prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { userId: user.id } });
    await tx.user.update({
      where: { id: user.id },
      data: { timezone: payload.timezone },
    });
    return tx.availability.createMany({
      data: payload.slots.map((slot) => ({
        userId: user.id,
        timezone: payload.timezone,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isEnabled: slot.isEnabled,
      })),
    });
  });
}
