"use client";

import { Button } from "@/components/ui/button";
import { useSchema } from "@/hooks/useSchema";
import { toast } from "sonner";

interface DeleteSchemaConfirmationProps {
  id: number; // schema id
  onClose: () => void;
}

export default function DeleteSchemaConfirmation({
  id,
  onClose,
}: DeleteSchemaConfirmationProps) {
	const { deleteSchema, isMutating } = useSchema();

	const handleDeleteSchema = async () => {
		try {
			await deleteSchema(id);
		} catch (error) {
			toast.error('Failed to delete schema');
		}
		finally {
			onClose();
		}
	}

  return (
    <div className="flex gap-2 items-center justify-between">
      <Button variant="secondary" onClick={onClose} disabled={isMutating}>Cancel</Button>
      <Button variant="destructive" onClick={handleDeleteSchema} disabled={isMutating}>Delete</Button>
    </div>
  );
}
