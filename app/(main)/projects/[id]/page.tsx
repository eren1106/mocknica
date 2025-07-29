import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectOverviewPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Mock API URL</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-primary font-mono text-lg">
            {process.env.NEXT_PUBLIC_APP_URL}/api/mock/[project-id]
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Use this base URL to make requests to your project's mock endpoints.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Get started by creating your first endpoint, schema, or response wrapper.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity tracking coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
