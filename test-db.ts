import 'dotenv/config';
import { prisma } from './src/lib/db';

async function testConnection() {
  try {
    console.log('Testing Supabase database connection...\n');

    // Test 1: Count users
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount}`);

    // Test 2: Count listings
    const listingCount = await prisma.listing.count();
    console.log(`✅ Listings: ${listingCount}`);

    // Test 3: Fetch a sample listing
    const sampleListing = await prisma.listing.findFirst({
      include: {
        seller: {
          select: {
            walletAddress: true,
            displayName: true,
          },
        },
      },
    });

    if (sampleListing) {
      console.log('\n📋 Sample Listing:');
      console.log(`   Project: ${sampleListing.projectName}`);
      console.log(`   Type: ${sampleListing.type}`);
      console.log(`   Revenue: $${sampleListing.revenue.toLocaleString()}`);
      console.log(`   MAU: ${sampleListing.mau.toLocaleString()}`);
      console.log(`   Seller: ${sampleListing.seller.displayName}`);
      console.log(`   Fabrknt Score: ${sampleListing.suiteDataSnapshot?.fabrknt_score || 'N/A'}`);
    }

    console.log('\n🎉 Database connection successful!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
