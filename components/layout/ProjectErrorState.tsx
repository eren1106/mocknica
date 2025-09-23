import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProjectErrorStateProps {
  error?: string;
  onRetry?: () => void;
}

export const ProjectErrorState = ({ 
  error = "Failed to load project", 
  onRetry 
}: ProjectErrorStateProps) => {
  return (
    <div className="px-3 py-2">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {error}
        </AlertDescription>
      </Alert>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 w-full"
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
};