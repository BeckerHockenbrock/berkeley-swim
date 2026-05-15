import { AppShell } from "@/components/AppShell";
import { PassHelper } from "@/components/PassHelper";

export const metadata = {
  title: "Buy a pass - Berkeley Swim",
  description:
    "Plain-English shortcuts to the right Berkeley pool pass on CivicRec.",
};

export default function PassesPage() {
  return (
    <AppShell>
      <PassHelper />
    </AppShell>
  );
}
