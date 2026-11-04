import { redirect } from "next/navigation";

// Figma has no student dashboard: the student's home is "09 · Find work — task feed".
export default function StudentDashboardPage() {
  redirect("/tasks");
}
