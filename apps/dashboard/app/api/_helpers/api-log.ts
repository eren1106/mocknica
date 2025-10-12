import { NextRequest } from "next/server";

export function apiLog(req: NextRequest) {
  const { url, method } = req; // method = GET POST etc.

  const apiPrefix = "/api";
  const parsedUrl = new URL(url);
  const apiPath = parsedUrl.pathname.substring(apiPrefix.length);

  console.log(`\n${method} ${apiPath}`);
}