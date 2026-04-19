import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET points configs with levels
export async function GET() {
  try {
    const configs = await db.pointsConfig.findMany({
      where: { isActive: true },
      include: {
        levels: { orderBy: { order: 'asc' } },
        triggers: { include: { metric: true, badge: true } },
        boosts: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
        _count: { select: { memberPoints: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching points configs:', error);
    return NextResponse.json({ error: 'فشل في جلب إعدادات النقاط' }, { status: 500 });
  }
}

// POST create new points config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, description, descriptionAr, levels, triggers } = body;

    if (!name || !nameAr) {
      return NextResponse.json(
        { error: 'name and nameAr are required / الاسم مطلوب' },
        { status: 400 }
      );
    }

    const config = await db.pointsConfig.create({
      data: {
        name,
        nameAr,
        description: description ?? '',
        descriptionAr: descriptionAr ?? '',
        ...(levels && {
          levels: {
            create: levels.map((l: { threshold: number; name: string; nameAr: string; icon?: string; color?: string; order: number }) => ({
              threshold: l.threshold,
              name: l.name,
              nameAr: l.nameAr,
              icon: l.icon ?? '⭐',
              color: l.color ?? '#2E2973',
              order: l.order,
            })),
          },
        }),
        ...(triggers && {
          triggers: {
            create: triggers.map((t: { sourceType: string; metricId?: string; badgeId?: string; pointsPerUnit?: number; pointsFixed?: number }) => ({
              sourceType: t.sourceType,
              metricId: t.metricId ?? null,
              badgeId: t.badgeId ?? null,
              pointsPerUnit: t.pointsPerUnit ?? 0,
              pointsFixed: t.pointsFixed ?? 0,
            })),
          },
        }),
      },
      include: {
        levels: { orderBy: { order: 'asc' } },
        triggers: true,
      },
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error('Error creating points config:', error);
    return NextResponse.json({ error: 'فشل في إنشاء إعدادات النقاط' }, { status: 500 });
  }
}
