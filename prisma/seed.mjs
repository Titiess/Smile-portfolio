import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { id: "primary" },
    create: {
      id: "primary",
      name: "Smile Nikoro",
      title: "Environmental Engineer & HSE Professional",
      email: "smileniko18@gmail.com",
      linkedinUrl: "https://www.linkedin.com/in/smile-nikoro-a660553b3/",
    },
    update: {},
  });

  await prisma.siteSettings.createMany({
    data: [
      {
        key: "site-title",
        value: "Smile Nikoro | Environmental Engineering and HSE Portfolio",
      },
      {
        key: "site-description",
        value: "Environmental Engineering, HSE and sustainability portfolio of Smile Nikoro.",
      },
      { key: "contact-email", value: "smileniko18@gmail.com" },
    ],
    skipDuplicates: true,
  });

  const [experienceCount, educationCount, certCount, categoryCount] = await Promise.all([
    prisma.experience.count(),
    prisma.education.count(),
    prisma.certification.count(),
    prisma.projectCategory.count(),
  ]);

  if (experienceCount === 0) {
    await prisma.experience.createMany({
      data: [
        {
          organisation: "Transmission Company of Nigeria",
          jobTitle: "HSE Department",
          location: "Ughelli, Delta State",
          employmentType: "Industrial experience",
          description: "Industrial experience within the Health, Safety and Environment department.",
          status: "PUBLISHED",
          displayOrder: 0,
        },
        {
          organisation: "Owerri Municipal Council",
          jobTitle: "National Youth Service Corps (NYSC)",
          location: "Owerri, Imo State",
          employmentType: "National service",
          description: "Service in the Office of the Chairman.",
          status: "PUBLISHED",
          displayOrder: 1,
        },
      ],
    });
  }

  if (educationCount === 0) {
    await prisma.education.create({
      data: {
        institution: "Petroleum Training Institute",
        qualification: "Higher National Diploma (HND)",
        programme: "Environmental Engineering",
        status: "PUBLISHED",
        displayOrder: 0,
      },
    });
  }

  if (certCount === 0) {
    await prisma.certification.create({
      data: {
        name: "ISPON HSE Level 3",
        issuingBody: "ISPON",
        status: "PUBLISHED",
        displayOrder: 0,
      },
    });
  }

  if (categoryCount === 0) {
    await prisma.projectCategory.createMany({
      data: [
        { name: "Academic Project", slug: "academic-project" },
        { name: "Industrial Project", slug: "industrial-project" },
        { name: "Research Project", slug: "research-project" },
      ],
      skipDuplicates: true,
    });
  }
}

main()
  .catch((error) => {
    console.error("Database seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
