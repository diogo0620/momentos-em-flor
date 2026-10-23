import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "aiudndfwpejjftnjngii.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    allowedDevOrigins: ['192.168.1.74'],
};

export default nextConfig;