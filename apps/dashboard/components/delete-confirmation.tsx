import { Button } from "./ui/button";

interface DeleteConfirmationProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function DeleteConfirmation({
  title,
  description,
  onConfirm,
  onCancel,
  isLoading,
  children,
  }: DeleteConfirmationProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-lg">{title ?? "Are you sure you want to delete this item?"}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children && children}
      <div className="flex items-center gap-2 justify-between">
        <Button onClick={onCancel} variant="secondary" disabled={isLoading}>Cancel</Button>
        <Button onClick={onConfirm} variant="destructive" disabled={isLoading}>Delete</Button>
      </div>
    </div>
  );
}
