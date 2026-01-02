/**
 * Test Company table connection
 */

import { prisma } from "../src/lib/db";

async function testConnection() {
    try {
        console.log("🔌 Connecting to database...");
        await prisma.$connect();
        console.log("✅ Connected");

        console.log("📊 Checking Company table...");
        const count = await prisma.company.count();
        console.log(`✅ Company table exists, count: ${count}`);

        if (count > 0) {
            const sample = await prisma.company.findFirst({
                select: { slug: true, name: true, overallScore: true },
            });
            console.log(`📝 Sample company:`, sample);
        }

        await prisma.$disconnect();
        console.log("✅ Disconnected");
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    }
}

testConnection();
