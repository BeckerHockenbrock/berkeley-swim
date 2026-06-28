import {
  Waves,
  Dumbbell,
  Baby,
  Users,
  Timer,
  HeartPulse,
  Trophy,
  GraduationCap,
  Music,
  ShowerHead,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps a program slug to the icon shown on its schedule card. Anything not
 * listed falls back to {@link Waves}, so new programs render sensibly without a
 * code change.
 */
const ICONS: Record<string, LucideIcon> = {
  'lap-swim': Waves,
  'independent-exercise': Dumbbell,
  'family-swim': Baby,
  'community-swim': Users,
  'aquatic-masters': Timer,
  'senior-exercise': HeartPulse,
  'barracudas': Trophy,
  'swim-lessons': GraduationCap,
  'aqua-zumba': Music,
  'shower-program': ShowerHead,
};

export function programIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? Waves;
}
