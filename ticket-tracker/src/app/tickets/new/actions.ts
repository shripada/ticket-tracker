'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';

export type TicketState = { error?: string };

const ONE_MB = 1 * 1024 * 1024;

cloudinary.config({ secure: true });

export async function createTicket(_prev: TicketState, formData: FormData): Promise<TicketState> {
  const session = await requireAuth();

  const title = ((formData.get('title') as string) ?? '').trim();
  const description = ((formData.get('description') as string) ?? '').trim();
  const categoryId = (formData.get('categoryId') as string) ?? '';
  const suggestedPriority = (formData.get('suggestedPriority') as string) ?? '';
  const attachment = formData.get('attachment') as File | null;

  if (!title) return { error: 'Title is required.' };
  if (!description) return { error: 'Description is required.' };
  if (!categoryId) return { error: 'Category is required.' };
  if (!suggestedPriority) return { error: 'Priority is required.' };

  // Rate limit: Users only
  if (session.role === Role.USER) {
    const settings = await prisma.settings.findFirst();
    const limit = settings?.maxOpenTicketsPerUser ?? 5;
    const openCount = await prisma.ticket.count({
      where: { createdById: session.userId, status: { in: ['OPEN', 'IN_PROGRESS', 'ON_HOLD'] } },
    });
    if (openCount >= limit) {
      return {
        error: `You have reached the limit of ${limit} open tickets. Please wait until some are resolved.`,
      };
    }
  }

  // Handle attachment
  let attachmentData: { url: string; filename: string; size: number; mimeType: string } | null =
    null;
  if (attachment && attachment.size > 0) {
    const isImage = attachment.type.startsWith('image/');
    if (!isImage && attachment.size > ONE_MB) {
      return { error: 'Non-image attachments must be 1 MB or smaller.' };
    }

    const bytes = await attachment.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string; bytes: number; format: string }>(
      (resolve, reject) => {
        const options = isImage
          ? {
              resource_type: 'image' as const,
              format: 'jpg',
              transformation: [{ quality: 'auto', fetch_format: 'jpg' }],
            }
          : { resource_type: 'raw' as const };

        cloudinary.uploader
          .upload_stream(options, (err, result) => {
            if (err || !result) return reject(err ?? new Error('Upload failed'));
            resolve(result as { secure_url: string; bytes: number; format: string });
          })
          .end(buffer);
      },
    );

    attachmentData = {
      url: uploadResult.secure_url,
      filename: isImage ? attachment.name.replace(/\.[^.]+$/, '.jpg') : attachment.name,
      size: uploadResult.bytes,
      mimeType: isImage ? 'image/jpeg' : attachment.type,
    };
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const t = await tx.ticket.create({
      data: {
        title,
        description,
        categoryId,
        suggestedPriority: suggestedPriority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        createdById: session.userId,
        ...(attachmentData
          ? {
              attachments: {
                create: {
                  url: attachmentData.url,
                  filename: attachmentData.filename,
                  size: attachmentData.size,
                  mimeType: attachmentData.mimeType,
                },
              },
            }
          : {}),
      },
    });

    await tx.activityLog.create({
      data: {
        action: 'TICKET_CREATED',
        ticketId: t.id,
        actorId: session.userId,
      },
    });

    return t;
  });

  revalidatePath('/tickets');
  redirect(`/tickets/${ticket.id}`);
}
