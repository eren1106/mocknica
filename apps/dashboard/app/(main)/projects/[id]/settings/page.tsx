import type { Metadata } from "next";
import ProjectSettings from "../../_ui/ProjectSettings";

export const metadata: Metadata = {
  title: "Settings",
};

export default function ProjectSettingsPage() {
  return <ProjectSettings />;
}
