import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { eventTypeSchema } from "@/lib/validators";
import { getDefaultUser } from "./user.service";

export async function listEventTypes() {
  const user = await getDefaultUser();
  return prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventTypeById(id: string) {
  const user = await getDefaultUser();
  return prisma.eventType.findFirst({ where: { id, userId: user.id } });
}

export async function getEventTypeBySlug(slug: string) {
  return prisma.eventType.findUnique({ where: { slug } });
}

export async function createEventType(input: unknown) {
  const payload = eventTypeSchema.parse(input);
  const user = await getDefaultUser();
  const baseSlug = slugify(payload.title, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.eventType.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  return prisma.eventType.create({
    data: {
      userId: user.id,
      title: payload.title,
      description: payload.description || null,
      duration: payload.duration,
      slug,
      bufferBefore: payload.bufferBefore,
      bufferAfter: payload.bufferAfter,
      customQuestions: payload.customQuestions ?? [],
    },
  });
}

export async function updateEventType(id: string, input: unknown) {
  const payload = eventTypeSchema.parse(input);
  const user = await getDefaultUser();
  const existing = await prisma.eventType.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Event type not found");
  return prisma.eventType.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description || null,
      duration: payload.duration,
      bufferBefore: payload.bufferBefore,
      bufferAfter: payload.bufferAfter,
      customQuestions: payload.customQuestions ?? [],
    },
  });
}

export async function deleteEventType(id: string) {
  const user = await getDefaultUser();
  const existing = await prisma.eventType.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Event type not found");
  return prisma.eventType.delete({
    where: { id },
  });
}
