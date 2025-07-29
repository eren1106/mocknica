import ProjectManagement from "@/components/project/ProjectManagement";

export default function Home() {
  return (
    <div className="container mx-auto p-8 w-full">
      <div className="flex flex-col gap-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Mocka</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create and manage mock APIs for your development needs
          </p>
        </div>
        <ProjectManagement />
      </div>
    </div>
  );
}
