const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
process.env.DATABASE_URL = 'file:' + path.resolve(__dirname, '../prisma/dev.db');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING FOUNDER STATUS & PASSWORD FOR YUVEERJI ---');

  const plainPassword = 'Yuveer5747';
  const hash = await bcrypt.hash(plainPassword, 10);

  // 1. Update/Ensure Participant Users for @yuveerji with password Yuveer5747
  const updatedParticipants = await prisma.participantUser.updateMany({
    where: {
      OR: [
        { username: 'yuveerji' },
        { username: 'yuveer' },
        { username: 'chhatwani' },
        { email: 'yuveerchhatwani18@gmail.com' },
        { email: 'chhatwaniyuveer@gmail.com' }
      ]
    },
    data: {
      role: 'FOUNDER',
      passwordHash: hash
    }
  });
  console.log(`Updated ${updatedParticipants.count} participant users to FOUNDER role and password hash.`);

  // Ensure exact username @yuveerji is present
  const existingYuveerji = await prisma.participantUser.findFirst({
    where: {
      OR: [
        { username: 'yuveerji' },
        { email: 'yuveerchhatwani18@gmail.com' }
      ]
    }
  });

  if (!existingYuveerji) {
    await prisma.participantUser.create({
      data: {
        fullName: 'Yuveer Chhatwani',
        username: 'yuveerji',
        email: 'yuveerchhatwani18@gmail.com',
        phone: '+91 91165 02522',
        passwordHash: hash,
        role: 'FOUNDER',
        isActive: true,
        isEmailVerified: true
      }
    });
    console.log('Created new ParticipantUser @yuveerji with role FOUNDER and password Yuveer5747.');
  } else {
    await prisma.participantUser.update({
      where: { id: existingYuveerji.id },
      data: {
        username: 'yuveerji',
        passwordHash: hash,
        role: 'FOUNDER',
        isActive: true
      }
    });
    console.log(`Updated ParticipantUser ${existingYuveerji.id} (@yuveerji) password to Yuveer5747.`);
  }

  // 2. Ensure AdminUser records exist with FOUNDER role and password Yuveer5747
  const founderEmails = [
    { email: 'yuveerchhatwani18@gmail.com', name: 'Yuveer (Founder)' },
    { email: 'chhatwaniyuveer@gmail.com', name: 'Yuveer Chhatwani (Founder)' },
    { email: 'founder@thevichaarcouncil.in', name: 'Yuveer Founder' }
  ];

  for (const item of founderEmails) {
    const existing = await prisma.adminUser.findUnique({ where: { email: item.email } });
    if (existing) {
      await prisma.adminUser.update({
        where: { id: existing.id },
        data: {
          role: 'FOUNDER',
          name: item.name,
          isActive: true,
          passwordHash: hash
        }
      });
      console.log(`Updated AdminUser: ${item.email} to FOUNDER with password Yuveer5747`);
    } else {
      await prisma.adminUser.create({
        data: {
          email: item.email,
          name: item.name,
          passwordHash: hash,
          role: 'FOUNDER',
          isActive: true
        }
      });
      console.log(`Created AdminUser: ${item.email} as FOUNDER with password Yuveer5747`);
    }
  }

  // 3. Update SiteSetting ADMIN_WHITELIST
  const whitelist = [
    'admin@thevichaarcouncil.in',
    'admin@vichaarcouncil.org',
    'thevichaarcouncil@gmail.com',
    'yuveerchhatwani18@gmail.com',
    'chhatwaniyuveer@gmail.com',
    'founder@thevichaarcouncil.in',
    'yuveerji',
    'chhatwani',
    'yuveer'
  ];

  await prisma.siteSetting.upsert({
    where: { key: 'ADMIN_WHITELIST' },
    update: { value: JSON.stringify(whitelist) },
    create: {
      key: 'ADMIN_WHITELIST',
      value: JSON.stringify(whitelist),
      description: 'Authorized admin emails and usernames with clearance to access /admin'
    }
  });
  console.log('Updated ADMIN_WHITELIST site setting.');

  // Check results
  const pUsers = await prisma.participantUser.findMany({
    select: { id: true, username: true, email: true, role: true }
  });
  console.log('Participant Users now:', pUsers);

  const aUsers = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('Admin Users now:', aUsers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
