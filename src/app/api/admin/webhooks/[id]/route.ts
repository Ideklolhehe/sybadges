import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single webhook
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhook = await db.webhook.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { deliveries: true } },
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: 'الويب هوك غير موجود' }, { status: 404 });
    }

    // Don't expose the secret
    const { secret, ...rest } = webhook;
    return NextResponse.json({ ...rest, hasSecret: !!secret });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json({ error: 'فشل في جلب الويب هوك' }, { status: 500 });
  }
}

// PUT update webhook
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { url, events, isActive } = body;

    const existing = await db.webhook.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'الويب هوك غير موجود' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (url !== undefined) updateData.url = url;
    if (events !== undefined) updateData.events = JSON.stringify(events);
    if (isActive !== undefined) updateData.isActive = isActive;

    const webhook = await db.webhook.update({
      where: { id: params.id },
      data: updateData,
    });

    const { secret, ...rest } = webhook;
    return NextResponse.json({ ...rest, hasSecret: !!secret });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json({ error: 'فشل في تحديث الويب هوك' }, { status: 500 });
  }
}

// DELETE webhook
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.webhook.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'الويب هوك غير موجود' }, { status: 404 });
    }

    await db.webhook.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'تم حذف الويب هوك بنجاح' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'فشل في حذف الويب هوك' }, { status: 500 });
  }
}
