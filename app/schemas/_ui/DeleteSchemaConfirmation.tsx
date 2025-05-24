"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutationSchema } from "@/hooks/useSchema";

interface DeleteSchemaConfirmationProps {
  id: number; // schema id
  onClose: () => void;
}

export default function DeleteSchemaConfirmation({
  id,
  onClose,
}: DeleteSchemaConfirmationProps) {
	const { deleteSchema, isPending } = useMutationSchema();

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
      <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
      <Button variant="destructive" onClick={handleDeleteSchema} disabled={isPending}>Delete</Button>
    </div>
  );
}
