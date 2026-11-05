import type { NextConfig } from "next";

const configuredFilesUrl = process.env.NEXT_PUBLIC_FILES_URL;
const backendOrigin = process.env.BACKEND_ORIGIN?.trim().replace(/\/$/, "");
const configuredFilesPattern = (() => {
    if (!configuredFilesUrl) return null;

    try {
        const url = new URL(configuredFilesUrl);
        return {
            protocol: url.protocol.replace(":", "") as "http" | "https",
            hostname: url.hostname,
            port: url.port,
            pathname: `${url.pathname.replace(/\/$/, "")}/**`,
        };
    } catch {
        return null;
    }
})();

const nextConfig: NextConfig = {
    output: "standalone",
    async rewrites() {
        if (!backendOrigin) return [];

        return [
            {
                source: "/api/:path*",
                destination: `${backendOrigin}/api/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "aiudndfwpejjftnjngii.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            ...(configuredFilesPattern ? [configuredFilesPattern] : []),
        ],
    },
    allowedDevOrigins: ["192.168.1.74"],
};

export default nextConfig;
