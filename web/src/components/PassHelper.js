import { civicRecLinks } from "@/lib/civicrec";

const CARDS = [
  {
    title: "Swim once",
    body: "A single drop-in. Resident and non-resident variants on the same page.",
    cta: "Daily Aquatic Drop-In Pass",
    href: civicRecLinks.dailyAquaticPass,
  },
  {
    title: "Swim regularly (Lap, Family, Recreation)",
    body: "Lap Swim and Family Swim use the same Aquatic Drop-In Pass - there is no separate SKU. Pick a Daily, 10-swim, or Monthly pass.",
    cta: "Aquatic Drop-In Passes",
    href: civicRecLinks.aquaticPasses,
  },
  {
    title: "Punch card (10 swims)",
    body: "Pay once, swim ten times. Best if you swim a few times a month.",
    cta: "10 Swims Aquatic Pass",
    href: civicRecLinks.tenSwimPass,
  },
  {
    title: "Monthly pass",
    body: "Unlimited drop-in swims for a calendar month.",
    cta: "Monthly Aquatic Pass",
    href: civicRecLinks.monthlyAquaticPass,
  },
  {
    title: "Senior Exercise",
    body: "Senior Exercise requires a premium aquatic pass. Pick a premium Daily, 10-swim, or Monthly option.",
    cta: "Premium Aquatic Passes",
    href: civicRecLinks.premiumAquaticPasses,
  },
  {
    title: "Aqua Zumba",
    body: "Drop-in class with its own per-session fee on CivicRec.",
    cta: "Aqua Zumba sessions",
    href: civicRecLinks.aquaZumba,
  },
  {
    title: "Kids' swim lessons",
    body: "Learn-To-Swim Levels 1 to 4 at King Pool and West Campus Pool.",
    cta: "Learn-To-Swim classes",
    href: civicRecLinks.learnToSwim,
  },
  {
    title: "Parent and child lessons",
    body: "Group lessons for caregivers with infants and toddlers.",
    cta: "Parent and Child Aquatics",
    href: civicRecLinks.parentChildAquatics,
  },
  {
    title: "Teams or other programs",
    body: "Anything else (adult lessons, masters, team programs) lives in the main catalog under Swim Lessons or the relevant category.",
    cta: "Open CivicRec catalog",
    href: civicRecLinks.mainCatalog,
  },
];

export function PassHelper() {
  return (
    <>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            Buy a pass
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Plain-English shortcuts into the City of Berkeley CivicRec catalog.
            Pick the option that matches what you want to do; the link takes
            you straight to the right page.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Berkeley Swim does not sell passes.</p>
        <p className="mt-1">
          We are not affiliated with the City of Berkeley. All purchases happen
          on the City&rsquo;s CivicRec site. These links just save you the
          guesswork of finding the right page.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              I already know what I need
            </h2>
            <p className="mt-1 text-sm text-muted">
              Jump straight to the full CivicRec catalog.
            </p>
          </div>
          <a
            href={civicRecLinks.mainCatalog}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center rounded-md bg-pool px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Open the CivicRec catalog
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Choose by what you want to do
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-surface p-4 shadow-sm"
            >
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{card.body}</p>
              </div>
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex min-h-9 items-center justify-center rounded-md border border-pool px-3 py-2 text-sm font-semibold text-pool transition hover:bg-sky-50"
              >
                {card.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
        <h2 className="text-base font-semibold text-foreground">
          Why is the City&rsquo;s pass page confusing?
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            CivicRec product names don&rsquo;t match what swimmers say. Lap
            Swim and Family Swim are pool activities, not products - you buy a
            generic &ldquo;Aquatic Drop-In Pass&rdquo; and use it for either.
          </li>
          <li>
            Searching &ldquo;Family Swim,&rdquo; &ldquo;Lap Swim,&rdquo; or
            &ldquo;Senior Exercise&rdquo; in CivicRec returns zero results,
            even though those activities run every week.
          </li>
          <li>
            Senior Exercise needs a separate <em>premium</em> aquatic pass, not
            the regular one.
          </li>
          <li>
            The Aquatics category link on CivicRec currently loads Special
            Events instead of pool passes, so the obvious navigation path is
            broken.
          </li>
          <li>
            Swim lesson registration is seasonal and lives under the Swim
            Lessons category in the main catalog rather than a stable search
            link.
          </li>
        </ul>
      </section>
    </>
  );
}
