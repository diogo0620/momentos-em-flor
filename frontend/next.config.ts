import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "homeflora.pt",
            },
        ],
    },
};

export default nextConfig;