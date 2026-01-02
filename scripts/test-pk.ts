import { PublicKey } from "@solana/web3.js";

const testAddresses = [
    "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    "dRiftyHA39bWEY4nXUvNnprgNa8gvhcteAdT",
    "dRiftyHA39bWEY4nXUvNnprgNa8gvhcteAdT" // copied again
];

testAddresses.forEach(id => {
    try {
        const pk = new PublicKey(id);
        console.log(`Valid: ${id} -> ${pk.toBase58()}`);
    } catch (e) {
        console.error(`Invalid: ${id} -> ${e.message}`);
    }
});
