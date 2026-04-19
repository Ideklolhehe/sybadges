import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all webhooks
export async function GET() {
  try {
    const webhooks = await db.webhook.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { deliveries: true } },
      },
    });

    // Don't expose secrets in list view
    const sanitized = webhooks.map(({ secret, ...wh }) => ({
      ...wh,
      hasSecret: !!secret,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'فشل في جلب الويب هوك' }, { status: 500 });
  }
}

// POST create new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, events } = body;

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    // Generate a random secret for HMAC signing
    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const secret = Array.from(secretBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const webhook = await db.webhook.create({
      data: {
        url,
        secret,
        events: JSON.stringify(events ?? []),
      },
    });

    // Return the secret only on creation (once)
    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الويب هوك' }, { status: 500 });
  }
}
