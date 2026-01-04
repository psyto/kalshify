import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const companies = await prisma.company.findMany({
    select: {
      slug: true,
      name: true,
      logo: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(companies);
}
