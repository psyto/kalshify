"use client";

import dynamic from "next/dynamic";

// Dynamically import with ssr: false to prevent prerendering
// This is needed because the component uses wagmi hooks that require browser context
const CreateListingClient = dynamic(
    () => import("./CreateListingClient").then((mod) => ({ default: mod.CreateListingClient })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        ),
    }
);

export default function CreateListingPage() {
    return <CreateListingClient />;
}
