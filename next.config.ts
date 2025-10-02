import type { NextConfig } from "next";

// if origins not set, default to ["*"], which allows all origins
// const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ["*"];

const nextConfig: NextConfig = {
  // async headers() {
  //   // Create headers for each allowed origin
  //   const headerConfigs = allowedOrigins.map(origin => ({
  //     source: "/api/mock/:path*",
  //     headers: [
  //       { key: "Access-Control-Allow-Credentials", value: "true" },
  //       { key: "Access-Control-Allow-Origin", value: origin },
  //       {
  //         key: "Access-Control-Allow-Methods",
  //         value: "GET,DELETE,PATCH,POST,PUT,OPTIONS", // OPTIONS is related to CORS preflight request
  //       },
  //       {
  //         key: "Access-Control-Allow-Headers",
  //         value:
  //           "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  //       },
  //     ],
  //   }));
    
  //   return headerConfigs;
  // },
};

export default nextConfig;
