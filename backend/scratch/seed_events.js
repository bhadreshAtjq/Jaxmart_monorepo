const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting event seeding...');

  // Clean existing events if any
  await prisma.event.deleteMany({});
  console.log('🧹 Cleaned existing events');

  const events = [
    {
      title: "Global Manufacturing Expo 2026",
      description: "Connect with over 500+ verified industrial suppliers and factories showcasing the latest CNC machinery, automation equipment, and heavy industrial supplies.",
      date: new Date("2026-08-15T09:00:00Z"),
      location: "Pragati Maidan, New Delhi",
      mediaUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
      isActive: true
    },
    {
      title: "SustainB2B Green Technology Summit",
      description: "Discover modern solar tech, energy-efficient manufacturing processes, and green logistics solutions for sustainable industrial growth.",
      date: new Date("2026-09-22T10:00:00Z"),
      location: "Virtual Event (Online)",
      mediaUrl: "https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&q=80&w=800",
      isActive: true
    },
    {
      title: "National Textile & Sourcing Fair",
      description: "Meet premium manufacturers of organic yarn, finished fabrics, raw cotton, and apparel machinery under one roof with secure escrow matching.",
      date: new Date("2026-10-05T09:30:00Z"),
      location: "BIEC, Bengaluru",
      mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
      isActive: true
    }
  ];

  for (const event of events) {
    const record = await prisma.event.create({
      data: event
    });
    console.log(`✅ Created event: ${record.title}`);
  }

  console.log('🏁 Event seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
