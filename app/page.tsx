import EndpointManagement from "@/components/endpoint/EndpointManagement";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-8 w-full">
      <div className="flex flex-col gap-8">
        <Card>
          <h3 className="font-medium">Mock API URL:</h3>
          <p className="text-primary font-mono">
            {process.env.NEXT_PUBLIC_APP_URL}/api/mock
          </p>
        </Card>
        <EndpointManagement />
      </div>
    </div>
  );
}
