import { addDays, addHours } from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "owner@calclone.dev" },
    update: {},
    create: {
      email: "owner@calclone.dev",
      name: "Default Host",
      timezone: "America/New_York",
    },
  });

  const eventTypes = await Promise.all([
    prisma.eventType.upsert({
      where: { slug: "intro-call" },
      update: {},
      create: {
        userId: user.id,
        title: "Intro Call",
        description: "Quick introduction and project overview.",
        duration: 30,
        slug: "intro-call",
      },
    }),
    prisma.eventType.upsert({
      where: { slug: "product-demo" },
      update: {},
      create: {
        userId: user.id,
        title: "Product Demo",
        description: "Live walkthrough of platform capabilities.",
        duration: 45,
        slug: "product-demo",
        bufferBefore: 10,
        bufferAfter: 10,
      },
    }),
    prisma.eventType.upsert({
      where: { slug: "strategy-session" },
      update: {},
      create: {
        userId: user.id,
        title: "Strategy Session",
        description: "Deep dive into goals, roadmap, and blockers.",
        duration: 60,
        slug: "strategy-session",
      },
    }),
  ]);

  await prisma.availability.deleteMany({ where: { userId: user.id } });
  await prisma.availability.createMany({
    data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      userId: user.id,
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      timezone: "America/New_York",
      isEnabled: true,
    })),
  });

  const tomorrow = addDays(new Date(), 1);
  await prisma.booking.createMany({
    data: [
      {
        eventTypeId: eventTypes[0].id,
        userId: user.id,
        guestName: "Alex Johnson",
        guestEmail: "alex@example.com",
        guestTimezone: "America/Los_Angeles",
        startTime: addHours(tomorrow, 14),
        endTime: addHours(tomorrow, 14.5),
        status: "SCHEDULED",
      },
      {
        eventTypeId: eventTypes[1].id,
        userId: user.id,
        guestName: "Riya Verma",
        guestEmail: "riya@example.com",
        guestTimezone: "Europe/London",
        startTime: addHours(tomorrow, 16),
        endTime: addHours(tomorrow, 16.75),
        status: "SCHEDULED",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
