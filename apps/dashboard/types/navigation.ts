import { LucideProps } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  badge?: string;
  disabled?: boolean;
}