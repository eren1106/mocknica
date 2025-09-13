import { useParams } from "next/navigation";

export const useCurrentProjectId = () => {
  const params = useParams<{ id: string }>();
  return params.id;
};
