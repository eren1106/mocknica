import type { Metadata } from "next";
import EndpointsPageContent from "@/components/endpoint/EndpointsPageContent";

export const metadata: Metadata = {
  title: "Endpoints",
};

export default function EndpointsPage() {
  return <EndpointsPageContent />;
}
