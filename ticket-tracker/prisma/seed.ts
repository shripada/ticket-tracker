import { PrismaClient, Role, Priority, TicketStatus, ActivityAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password1!', 10);

  // Settings
  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      orgName: 'Acme Corp',
      allowedDomains: ['acme.com'],
    },
  });

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      name: 'Alice Admin',
      email: 'admin@acme.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@acme.com' },
    update: {},
    create: {
      name: 'Bob Agent',
      email: 'agent@acme.com',
      passwordHash,
      role: Role.AGENT,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'charlie@acme.com' },
    update: {},
    create: {
      name: 'Charlie User',
      email: 'charlie@acme.com',
      passwordHash,
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'diana@acme.com' },
    update: {},
    create: {
      name: 'Diana User',
      email: 'diana@acme.com',
      passwordHash,
      role: Role.USER,
    },
  });

  // Allowlist
  for (const entry of [
    { name: 'Alice Admin', email: 'admin@acme.com' },
    { name: 'Bob Agent', email: 'agent@acme.com' },
    { name: 'Charlie User', email: 'charlie@acme.com' },
    { name: 'Diana User', email: 'diana@acme.com' },
  ]) {
    await prisma.allowlist.upsert({
      where: { email: entry.email },
      update: {},
      create: entry,
    });
  }

  // Categories
  const bugCategory = await prisma.category.upsert({
    where: { name: 'Bug' },
    update: {},
    create: { name: 'Bug' },
  });

  const itCategory = await prisma.category.upsert({
    where: { name: 'IT Support' },
    update: {},
    create: { name: 'IT Support' },
  });

  const generalCategory = await prisma.category.upsert({
    where: { name: 'General' },
    update: {},
    create: { name: 'General' },
  });

  // Tickets
  const openTicket = await prisma.ticket.create({
    data: {
      title: 'Login page crashes on mobile',
      description: 'The login page throws a JS error on Safari iOS 17.',
      status: TicketStatus.OPEN,
      suggestedPriority: Priority.HIGH,
      categoryId: bugCategory.id,
      createdById: user1.id,
    },
  });

  const inProgressTicket = await prisma.ticket.create({
    data: {
      title: 'VPN access request',
      description: 'Need VPN credentials for remote work setup.',
      status: TicketStatus.IN_PROGRESS,
      suggestedPriority: Priority.MEDIUM,
      assignedPriority: Priority.LOW,
      categoryId: itCategory.id,
      createdById: user2.id,
      assignedToId: agent.id,
    },
  });

  const resolvedTicket = await prisma.ticket.create({
    data: {
      title: 'Expense report not submitting',
      description: 'Submit button on expense form is unresponsive.',
      status: TicketStatus.RESOLVED,
      suggestedPriority: Priority.MEDIUM,
      assignedPriority: Priority.MEDIUM,
      categoryId: generalCategory.id,
      createdById: user1.id,
      assignedToId: agent.id,
      resolvedAt: new Date(),
    },
  });

  const closedTicket = await prisma.ticket.create({
    data: {
      title: 'Request for new monitor',
      description: 'Would like a second monitor for my workstation.',
      status: TicketStatus.CLOSED,
      suggestedPriority: Priority.LOW,
      categoryId: generalCategory.id,
      createdById: user2.id,
    },
  });

  // Comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Can you share the exact error message you see?',
      ticketId: openTicket.id,
      authorId: agent.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'It says "Cannot read properties of undefined (reading \'token\')".',
      ticketId: openTicket.id,
      authorId: user1.id,
    },
  });

  // Attachment (on comment)
  await prisma.attachment.create({
    data: {
      filename: 'screenshot.jpg',
      url: 'https://example.com/attachments/screenshot.jpg',
      size: 204800,
      mimeType: 'image/jpeg',
      commentId: comment1.id,
    },
  });

  // Attachment (on ticket)
  await prisma.attachment.create({
    data: {
      filename: 'error-log.txt',
      url: 'https://example.com/attachments/error-log.txt',
      size: 1024,
      mimeType: 'text/plain',
      ticketId: openTicket.id,
    },
  });

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        ticketId: openTicket.id,
        actorId: user1.id,
        action: ActivityAction.TICKET_CREATED,
      },
      {
        ticketId: openTicket.id,
        actorId: agent.id,
        action: ActivityAction.COMMENT_ADDED,
        metadata: { commentId: comment1.id },
      },
      {
        ticketId: inProgressTicket.id,
        actorId: user2.id,
        action: ActivityAction.TICKET_CREATED,
      },
      {
        ticketId: inProgressTicket.id,
        actorId: agent.id,
        action: ActivityAction.ASSIGNED,
        metadata: { assignedToId: agent.id },
      },
      {
        ticketId: inProgressTicket.id,
        actorId: agent.id,
        action: ActivityAction.STATE_CHANGED,
        metadata: { from: 'OPEN', to: 'IN_PROGRESS' },
      },
      {
        ticketId: inProgressTicket.id,
        actorId: agent.id,
        action: ActivityAction.PRIORITY_OVERRIDDEN,
        metadata: { from: 'MEDIUM', to: 'LOW' },
      },
      {
        ticketId: resolvedTicket.id,
        actorId: user1.id,
        action: ActivityAction.TICKET_CREATED,
      },
      {
        ticketId: resolvedTicket.id,
        actorId: agent.id,
        action: ActivityAction.STATE_CHANGED,
        metadata: { from: 'OPEN', to: 'RESOLVED' },
      },
      {
        ticketId: closedTicket.id,
        actorId: user2.id,
        action: ActivityAction.TICKET_CREATED,
      },
      {
        ticketId: closedTicket.id,
        actorId: admin.id,
        action: ActivityAction.STATE_CHANGED,
        metadata: { from: 'OPEN', to: 'CLOSED' },
      },
    ],
  });

  console.log('Seed complete.');
  console.log(`  Settings: ${settings.orgName}`);
  console.log(`  Users: admin, agent, user×2`);
  console.log(`  Categories: Bug, IT Support, General`);
  console.log(`  Tickets: open, in-progress, resolved, closed`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
