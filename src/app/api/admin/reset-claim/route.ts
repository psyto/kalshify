import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find and show current claimed profile
    const existingProfile = await prisma.claimedProfile.findFirst({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({
        message: "No claimed profile found for your user",
        userId: user.id,
      });
    }

    // Delete the claimed profile
    await prisma.claimedProfile.delete({
      where: { id: existingProfile.id },
    });

    return NextResponse.json({
      message: "Successfully deleted claimed profile",
      deleted: {
        id: existingProfile.id,
        companySlug: existingProfile.companySlug,
        verified: existingProfile.verified,
      },
    });
  } catch (error) {
    console.error("Error resetting claim:", error);
    return NextResponse.json(
      { error: "Failed to reset claim" },
      { status: 500 }
    );
  }
}
