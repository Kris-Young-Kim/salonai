import { NextRequest, NextResponse } from 'next/server';
import { getRecommendedDyes, getDyeByTintName, HAIR_DYE_CHART } from '@/lib/data/hairDyeChart';
import { SeasonType } from '@/types/personalColor';

const VALID_SEASONS: SeasonType[] = [
  'SPRING_WARM',
  'SUMMER_COOL',
  'AUTUMN_WARM',
  'WINTER_COOL',
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const season = searchParams.get('season') as SeasonType | null;
  const tintName = searchParams.get('tintName');
  const tintHex = searchParams.get('hex');
  const brand = searchParams.get('brand'); // optional filter: MILBON | LOREAL | WELLA

  // Return full chart if no filters
  if (!season && !tintName && !tintHex) {
    return NextResponse.json({ data: HAIR_DYE_CHART });
  }

  // Lookup by tint name
  if (tintName) {
    const entry = getDyeByTintName(tintName);
    if (!entry) {
      return NextResponse.json({ error: '해당 틴트명이 없습니다.' }, { status: 404 });
    }
    const result = brand
      ? { ...entry, formulas: entry.formulas.filter((f) => f.brand === brand) }
      : entry;
    return NextResponse.json({ data: [result] });
  }

  // Lookup by season (+ optional hex)
  if (season) {
    if (!VALID_SEASONS.includes(season)) {
      return NextResponse.json(
        { error: '유효하지 않은 시즌 값입니다. (SPRING_WARM | SUMMER_COOL | AUTUMN_WARM | WINTER_COOL)' },
        { status: 400 }
      );
    }

    const entries = getRecommendedDyes(season, tintHex ?? undefined);
    const result = brand
      ? entries.map((e) => ({ ...e, formulas: e.formulas.filter((f) => f.brand === brand) }))
      : entries;

    return NextResponse.json({ data: result, season });
  }

  return NextResponse.json({ data: HAIR_DYE_CHART });
}
