import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "homeflora.pt",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3001",
                pathname: "/api/files/**",
            },
        ],
    },
};

export default nextConfig;