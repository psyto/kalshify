import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ hasClaimed: false, session: false });
    }

    const claimedProfile = await prisma.claimedProfile.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        companySlug: true,
        verified: true,
      },
    });

    return NextResponse.json({
      hasClaimed: !!claimedProfile,
      session: true,
      profile: claimedProfile,
    });
  } catch (error) {
    console.error("Error checking profile status:", error);
    return NextResponse.json({ hasClaimed: false, session: false });
  }
}
