
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        phone: true,
        fullName: true,
        isAdmin: true
      }
    });

    if (admins.length === 0) {
      console.log("No admins found in the database.");
    } else {
      console.log("Found the following admins:");
      admins.forEach(admin => {
        console.log(`- Name: ${admin.fullName}, Phone: ${admin.phone}`);
      });
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
