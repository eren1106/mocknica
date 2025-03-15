import EndpointManagement from "@/components/endpoint/EndpointManagement";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <h3 className="font-medium">Mock API URL:</h3>
        <p className="text-primary">{process.env.NEXT_PUBLIC_APP_URL}/api/mock</p>
      </Card>
      <EndpointManagement />
    </div>
  );
}
