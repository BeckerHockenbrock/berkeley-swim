import { civicRecLinks } from "@/lib/civicrec";

const CARDS = [
  {
    title: "Parent and Child Aquatics",
    body: "Caregiver-in-the-water classes for infants and toddlers (roughly 6 months to 3 years). Focus on water comfort, gentle submersion, kicking, and floating with support - no swimming expected.",
    cta: "Parent and Child Aquatics",
    href: civicRecLinks.parentChildAquatics,
  },
  {
    title: "Learn-To-Swim Level 1 - Intro",
    body: "First independent lessons for kids who are nervous in water. Bobs, blowing bubbles, supported floats, and kicking on a board. No swimming across the pool yet.",
    cta: "Learn-To-Swim classes",
    href: civicRecLinks.learnToSwim,
  },
  {
    title: "Learn-To-Swim Level 2 - Fundamentals",
    body: "For kids who are comfortable putting their face in. Independent front and back floats, gliding, and short distances of swimming with arms and legs together.",
    cta: "Learn-To-Swim classes",
    href: civicRecLinks.learnToSwim,
  },
  {
    title: "Learn-To-Swim Level 3 - Stroke development",
    body: "Builds front crawl and back crawl for the full length of the shallow end, plus jumps into deeper water and treading water basics.",
    cta: "Learn-To-Swim classes",
    href: civicRecLinks.learnToSwim,
  },
  {
    title: "Learn-To-Swim Level 4 - Stroke improvement",
    body: "Refines freestyle and backstroke, introduces breaststroke and butterfly, and adds deeper-water skills, longer distances, and rotary breathing.",
    cta: "Learn-To-Swim classes",
    href: civicRecLinks.learnToSwim,
  },
  {
    title: "Adult lessons, masters, teams",
    body: "Adult Swim Lessons, Masters, and team programs don't have a stable search link. Open the catalog and pick the Swim Lessons or program category.",
    cta: "Open CivicRec catalog",
    href: civicRecLinks.mainCatalog,
  },
];

export function LessonHelper() {
  return (
    <>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            Swim lessons
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Shortcuts to the right Berkeley swim-lesson registration page on
            CivicRec. Sessions are seasonal - if a link is empty, the next
            session hasn&rsquo;t opened for registration yet.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Berkeley Swim does not handle registration.</p>
        <p className="mt-1">
          We are not affiliated with the City of Berkeley. All sign-ups happen
          on the City&rsquo;s CivicRec site.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Pick the right lesson type
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
          Heads up about CivicRec lessons
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            The generic &ldquo;Swim Lessons&rdquo; keyword search returns zero
            results - Swim Lessons is a category, not a product name.
          </li>
          <li>
            &ldquo;Adult Swim Lessons&rdquo; also returns zero results from
            search; you have to enter through the Swim Lessons category.
          </li>
          <li>
            Sessions are seasonal. A link that&rsquo;s empty today may fill in
            when the next registration window opens.
          </li>
        </ul>
      </section>
    </>
  );
}
