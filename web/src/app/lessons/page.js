import { AppShell } from "@/components/AppShell";
import { LessonHelper } from "@/components/LessonHelper";

export const metadata = {
  title: "Swim lessons - Berkeley Swim",
  description:
    "Plain-English shortcuts to Berkeley swim lesson registration on CivicRec.",
};

export default function LessonsPage() {
  return (
    <AppShell>
      <LessonHelper />
    </AppShell>
  );
}
