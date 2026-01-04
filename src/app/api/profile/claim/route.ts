import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/profile/claim
 * Claim a company profile
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companySlug, verificationType } = body;

    if (!companySlug || !verificationType) {
      return NextResponse.json(
        { error: "Missing required fields: companySlug, verificationType" },
        { status: 400 }
      );
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if company is already claimed
    const existingClaim = await prisma.claimedProfile.findUnique({
      where: { companySlug },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "This company has already been claimed" },
        { status: 409 }
      );
    }

    // Create the claim (unverified initially)
    const claim = await prisma.claimedProfile.create({
      data: {
        userId: user.id,
        companySlug,
        verificationType,
        verified: false,
      },
    });

    return NextResponse.json({
      success: true,
      claim,
    });
  } catch (error) {
    console.error("Error claiming profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/claim
 * Get current user's claimed profile
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claim = await prisma.claimedProfile.findFirst({
      where: { userId: user.id },
    });

    if (!claim) {
      return NextResponse.json({ claim: null });
    }

    // Get company details
    const company = await prisma.company.findUnique({
      where: { slug: claim.companySlug },
    });

    return NextResponse.json({
      claim,
      company,
    });
  } catch (error) {
    console.error("Error fetching claimed profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
