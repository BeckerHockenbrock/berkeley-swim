export function parseTime(s: string) {
  const m = s.trim().replace(/\*+$/, '').match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toLowerCase() === 'pm') h += 12;
  return h * 60 + parseInt(m[2], 10);
}

export function getHappeningNow(poolData: any, dayIdx: number) {
  const now = new Date();
  const realDayIdx = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const mins = now.getHours() * 60 + now.getMinutes();

  if (dayIdx !== realDayIdx) {
    return { active: [], next: null, isToday: false };
  }

  const active: any[] = [];
  let next: any = null;

  Object.keys(poolData.programs).forEach((name) => {
    const raw = poolData.programs[name][dayIdx];
    if (!raw) return;

    raw.split(', ').forEach((slot: string) => {
      const parts = slot.split('–');
      if (parts.length < 2) return;

      const st = parseTime(parts[0]);
      const en = parseTime(parts[1]);
      if (st == null || en == null) return;

      if (mins >= st && mins < en) {
        active.push({ program: name, slot: slot.replace(/\*+/g, '') });
      } else if (st > mins) {
        if (!next || st < next.m) {
          next = { program: name, time: parts[0].trim().replace(/\*+/g, ''), m: st };
        }
      }
    });
  });

  return { active, next, isToday: true };
}
