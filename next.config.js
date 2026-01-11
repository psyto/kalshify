/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },
    transpilePackages: [
        // "@fabrknt/ui",
        // "@fabrknt/auth",
        // "@fabrknt/db",
        // "@fabrknt/api",
        // "@fabrknt/blockchain",
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cryptologos.cc',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'assets.coingecko.com',
            },
            {
                protocol: 'https',
                hostname: '*.io',
            },
            {
                protocol: 'https',
                hostname: '*.com',
            },
            {
                protocol: 'https',
                hostname: '*.global',
            },
            {
                protocol: 'https',
                hostname: '*.fi',
            },
            {
                protocol: 'https',
                hostname: '*.net',
            },
            {
                protocol: 'https',
                hostname: '*.ag',
            },
            {
                protocol: 'https',
                hostname: '*.trade',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
    // Empty turbopack config to silence Next.js 16 warning
    turbopack: {},
    webpack: (config, { isServer }) => {
        // Ignore React Native dependencies that MetaMask SDK tries to import
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "@react-native-async-storage/async-storage": false,
            "react-native": false,
        };

        // Ignore React Native modules in node_modules (both server and client)
        config.resolve.alias = {
            ...config.resolve.alias,
            "@react-native-async-storage/async-storage": false,
        };

        // Ignore problematic modules during build
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                "@react-native-async-storage/async-storage": false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
