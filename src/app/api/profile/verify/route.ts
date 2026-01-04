import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/profile/verify
 * Verify a claimed company profile
 *
 * For MVP: Simple verification (admin can approve)
 * Future: Implement domain verification, GitHub commit verification, wallet signature
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companySlug, verificationProof } = body;

    if (!companySlug) {
      return NextResponse.json(
        { error: "Missing required field: companySlug" },
        { status: 400 }
      );
    }

    // Find the claim
    const claim = await prisma.claimedProfile.findFirst({
      where: {
        userId: user.id,
        companySlug,
      },
    });

    if (!claim) {
      return NextResponse.json(
        { error: "No claim found for this company" },
        { status: 404 }
      );
    }

    if (claim.verified) {
      return NextResponse.json(
        { error: "This profile is already verified" },
        { status: 400 }
      );
    }

    // For MVP: Auto-verify (in production, this would require actual verification)
    const updatedClaim = await prisma.claimedProfile.update({
      where: { id: claim.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verificationProof: verificationProof || "MVP auto-verification",
      },
    });

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Error verifying profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
