import { prisma } from "../src/lib/db";

async function main() {
  // Show all claimed profiles
  const profiles = await prisma.claimedProfile.findMany({});

  console.log("\nCurrent Claimed Profiles:");
  console.log("========================");
  profiles.forEach((profile, index) => {
    console.log(`\n${index + 1}.`);
    console.log(`   Profile ID: ${profile.id}`);
    console.log(`   User ID: ${profile.userId}`);
    console.log(`   Company Slug: ${profile.companySlug}`);
    console.log(`   Verified: ${profile.verified}`);
    console.log(`   Created: ${profile.createdAt}`);
  });

  // Delete all claimed profiles
  const deleteResult = await prisma.claimedProfile.deleteMany({});

  console.log(`\n✅ Deleted ${deleteResult.count} claimed profile(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
