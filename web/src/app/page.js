import { AppShell } from "@/components/AppShell";
import { NowView } from "@/components/ScheduleViews";

export default function Home() {
  return (
    <AppShell>
      <NowView />
    </AppShell>
  );
}
