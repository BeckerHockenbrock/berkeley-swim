### 1. BUILD HEALTH
All steps pass cleanly.
- `npm install`: Passed, 0 vulnerabilities.
- `npm run lint`: Passed silently.
- `npm run test`: Passed (20/20 tests, 41ms).
- `npm run build`: Passed (built in 986ms).
- **Parser Execution**: The Python script ran perfectly and output exactly the same JSON data currently committed in `src/data/schedules/`. There were no git diffs.

### 2. SEVERITY-RANKED ISSUES FOUND

**[High] "Happening Now" displays phantom programs when a schedule is inactive**  
*Location: `src/components/ScheduleTab.tsx:77-94`*  
The "Happening Now" cards incorrectly evaluate slots purely based on the day of the week, ignoring the `validFrom` and `validThrough` bounds. If a user visits on March 15th (during the King-vs-West spring gap), West Campus is correctly flagged as "Upcoming" in the schedule list, but the Happening Now banner will falsely claim its programs are "Open now". The same applies after all schedules have expired (e.g. August 20).
*Fix:* In `findNextOpen` and `liveByPool`, explicitly return no live/upcoming programs if `getScheduleStatus(pools[pk], dateISO).kind !== 'ok'`.

**[Medium] Parser drops "Pool Closed" periods, masking mid-day closures**  
*Location: `scripts/parse_schedules.py:83`*  
The `slugify` function explicitly returns `None` for "Pool Closed". While this avoids breaking the UI, it actively hides mid-day facility closures (e.g., King Summer Friday 9:30am-1:00pm). The app currently just renders this time as an empty gap in the schedule, which might lead a user to assume they can drop by for independent exercise when the facility is physically locked.
*Fix:* Remove the explicit exclusion in the parser, map it to a "pool-closed" slug, and render it in the UI as a blackout block.

**[Low] "Closed today" badge mischaracterizes end-of-day state**  
*Location: `src/components/ScheduleTab.tsx:151-152`*  
If a user checks the app at 8:30 PM after all programs are over, the `findNextOpen` function rolls over to tomorrow (`offset > 0`). The UI then renders a "Closed today" badge. While technically accurate (the pool is closed for the remainder of today), this wording implies a full-day holiday closure and is confusing for evening visitors. 
*Fix:* Distinguish by checking if `pools[pk].closedDates.includes(now.dateISO)`. If true, show "Closed today". If false, show "Closed for the day".

### 3. INDEPENDENT CONFIRMATION OF PARSER CLAIMS

**I CONFIRM the author's claim.** The parser output matches the PDF images identically.
- **Saturday vs. Sunday column assignment:** Perfect. Despite the visual staggering in the PDFs (e.g., West Summer lap swim 4:30pm on Sat vs. 8:00am on Sun sharing space), the parser's x-coordinate midpoint mapping assigned every time cell accurately.
- **West PDFs (hyphens vs en-dashes / extra text):** Perfect. The regex `[\-–—]` successfully normalizes the dashes, and additional text like "w/ Carah" or "(register in advance)" falls away gracefully because the regex selectively extracts the time signatures.
- **The "Three Cells":** The old hand-typed data actually missed *more* than three cells in the King Spring schedule. It entirely dropped morning Independent Exercise from Tuesday through Friday, and it missed the Sunday Family Swim slot. The parser correctly restored all of them.

*Note on dates:* The only deliberate omission by the parser is dropping March 30 from West Campus's `closedDates` list in the Spring schedule. Since West Campus's Spring season doesn't start until April 6, discarding a March 30 closure is logically correct.

### 4. VERDICT
**Safe to ship conditionally.** The data ingestion pipeline is flawlessly accurate, but the "Happening Now" React component must be patched to respect schedule `validFrom`/`validThrough` boundaries before launching, otherwise it will misdirect users to a locked facility during the March transition period.
