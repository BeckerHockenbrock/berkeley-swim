export const info = {
  'Lap Swim': { d: 'Swim laps and practice your strokes during designated lap-swim hours.', a: '16+', c: '$7 resident · $8 non-resident' },
  'Independent Exercise (Dive Tank)': { d: 'Self-directed water exercise — water jogging or walking in the dive tank or shallow pool.', a: 'Shallow: all ages · Dive tank: 18+', c: '$7 resident · $8 non-resident' },
  'Family Swim (Shallow)': { d: 'Bring little ones of any age to splash around in the shallow pool.', a: 'All ages', c: '$7 resident · $8 non-resident' },
  'Community Swim': { d: 'All ages welcome to play in the entire pool during open community hours.', a: 'All ages', c: '$7 resident · $8 non-resident' },
  'Berkeley Aquatic Masters': { d: 'Coached workouts for swimmers of all abilities. Requires a premium pass.', a: '18+', c: '$8 resident · $10 non-resident (premium)' },
  'Senior Exercise': { d: 'Fun aerobic water exercises with other seniors. Requires a premium pass.', a: '55+', c: '$8 resident · $10 non-resident (premium)' },
  'Berkeley Barracudas': { d: 'Afterschool swim team across four levels. A tryout is required before registration.', a: '6–18 yrs', c: '$135 resident · $162 non-resident per 4-week session' },
  'Swim Lessons': { d: 'Gain comfort in the water and learn the fundamentals of swimming, with classes for every level.', a: '6 months – adult', c: '$44 – $88 per session' },
  'Aqua Zumba (register in advance)': { d: 'Water-based Zumba fitness class. Pre-registration required.', a: 'Adults', c: 'See online catalog' },
  'Aqua Zumba (pre-register)': { d: 'Water-based Zumba fitness class. Pre-registration required.', a: 'Adults', c: 'See online catalog' },
  'Aqua Zumba': { d: 'Water-based Zumba fitness class. Pre-registration required.', a: 'Adults', c: 'See online catalog' },
  'Shower Program': { d: 'Drop-in warm-shower access for community members.', a: 'All ages', c: 'See online catalog' },
};

export const poolsData = {
  king: {
    label: 'King Pool',
    programs: {
      'Lap Swim': [
        '6:00am–7:30am**, 7:30am–9:30am, 10:30am–12:00pm**, 12:00pm–1:00pm, 5:30pm–8:30pm',
        '6:00am–9:30am, 10:30am–12:00pm**, 12:00pm–1:00pm, 5:30pm–7:00pm, 7:00pm–8:30pm**',
        '6:00am–7:30am**, 7:30am–9:30am, 10:30am–12:00pm**, 12:00pm–1:00pm, 5:30pm–8:30pm',
        '6:00am–9:30am, 10:30am–12:00pm**, 12:00pm–1:00pm, 5:30pm–7:00pm, 7:00pm–8:30pm**',
        '6:00am–7:30am**, 7:30am–9:30am, 5:30pm–8:30pm',
        '8:00am–1:30pm, 3:30pm–5:30pm',
        '11:00am–1:00pm**, 1:00pm–3:30pm'
      ],
      'Berkeley Aquatic Masters': ['6:00am–7:30am', '7:00pm–8:30pm', '6:00am–7:30am', '7:00pm–8:30pm', '6:00am–7:30am', '9:30am–11:00am', ''],
      'Independent Exercise (Dive Tank)': [
        '6:00am–1:00pm, 5:30pm–8:30pm', '6:00am–1:00pm, 5:30pm–8:30pm', '6:00am–1:00pm, 5:30pm–8:30pm', '6:00am–1:00pm, 5:30pm–8:30pm',
        '6:00am–9:30am, 5:30pm–8:30pm', '8:00am–1:30pm, 3:30pm–5:30pm', '9:30am–3:30pm'
      ],
      'Swim Lessons': ['9:30am–12:00pm, 3:00pm–5:30pm', '9:30am–12:00pm, 3:00pm–5:30pm', '9:30am–12:00pm, 3:00pm–5:30pm', '9:30am–12:00pm, 3:00pm–5:30pm', '', '10:00am–1:00pm', ''],
      'Family Swim (Shallow)': ['12:00pm–1:00pm, 5:30pm–8:30pm', '12:00pm–1:00pm, 5:30pm–8:30pm', '12:00pm–1:00pm, 5:30pm–8:30pm', '12:00pm–1:00pm, 5:30pm–8:30pm', '5:30pm–8:30pm', '8:00am–1:30pm, 3:30pm–5:30pm', '1:00pm–3:30pm'],
      'Community Swim': ['1:00pm–3:00pm', '1:00pm–3:00pm', '1:00pm–3:00pm', '1:00pm–3:00pm', '1:00pm–3:00pm', '1:30pm–3:30pm', '3:30pm–5:30pm'],
    }
  },
  west: {
    label: 'West Campus Pool',
    programs: {
      'Lap Swim': ['7:00am–9:00am, 10:00am–12:00pm**, 12:00pm–1:00pm', '7:00am–9:00am, 10:00am–12:00pm**, 12:00pm–1:00pm', '7:00am–9:00am, 10:00am–12:00pm**, 12:00pm–1:00pm', '7:00am–9:00am, 10:00am–12:00pm**, 12:00pm–1:00pm', '7:00am–9:00am', '4:30pm–6:30pm', '8:00am–9:00am, 9:00am–10:00am**'],
      'Aqua Zumba (pre-register)': ['9:00am–10:00am', '', '', '', '', '', ''],
      'Senior Exercise': ['9:00am–10:00am', '9:00am–10:00am', '9:00am–10:00am', '9:00am–10:00am', '9:00am–10:00am', '', ''],
      'Berkeley Barracudas': ['5:00pm–7:00pm', '5:00pm–7:00pm', '5:00pm–7:00pm', '5:00pm–7:00pm', '5:00pm–7:00pm', '', ''],
      'Independent Exercise (Dive Tank)': ['7:00am–1:00pm', '7:00am–1:00pm', '7:00am–1:00pm', '7:00am–1:00pm', '7:00am–10:00am', '4:30pm–6:30pm', '8:00am–10:00am'],
      'Family Swim (Shallow)': ['7:00am–10:00am', '7:00am–10:00am', '7:00am–10:00am', '7:00am–10:00am', '7:00am–10:00am', '4:30pm–6:30pm', '8:00am–10:00am'],
      'Community Swim': ['1:00pm–3:00pm', '1:00pm–3:00pm', '1:00pm–3:00pm', '1:00pm–3:00pm', '1:00pm–4:00pm', '2:30pm–4:30pm', '10:00am–12:00pm'],
      'Swim Lessons': ['10:00am–12:00pm, 3:00pm–5:00pm', '10:00am–12:00pm, 3:00pm–5:00pm', '10:00am–12:00pm, 3:00pm–5:00pm', '10:00am–12:00pm, 3:00pm–5:00pm', '', '', ''],
      'Shower Program': ['7:15pm–8:15pm', '7:15pm–8:15pm', '7:15pm–8:15pm', '7:15pm–8:15pm', '7:15pm–8:15pm', '7:15pm–8:15pm', '7:15pm–8:15pm'],
    }
  }
};

export const lessonData = {
  lts: [
    { lvl: 'Level 1', title: 'Introduction to Water Skills', desc: 'Gain confidence in the pool environment — floating and kicking with support, blowing bubbles, and water-safety skills.', prereq: 'No prior experience necessary.', loc: 'King $44–$88 · West Campus $88' },
    { lvl: 'Level 2', title: 'Fundamental Aquatic Skills', desc: 'Learn independent locomotion on front and back, building a foundation for swimming strokes.', prereq: 'Comfortable kicking, floating, and blowing bubbles without instructor support.', loc: 'King $44–$88 · West Campus $88' },
    { lvl: 'Level 3', title: 'Stroke Development', desc: 'Learn side-breathing for the front crawl, develop further stroke skills, and get introduced to deep water.', prereq: 'Independent locomotion; can swim 10 yards on front and back.', loc: 'King $44–$88 · West Campus $88' },
    { lvl: 'Level 4', title: 'Stroke Improvement', desc: 'Improve proficiency and endurance over greater distances. Introduces back crawl, butterfly, and a simple open turn at the wall.', prereq: 'Builds on Level 3 skills.', loc: 'King $44–$88 · West Campus $88' },
    { lvl: 'Level 5 / 6', title: 'Stroke Refinement', desc: 'Refine all six strokes over greater distances and learn flip turns on front and back.', prereq: 'Can swim 25 yds front crawl with breathing and 25 yds back crawl.', loc: 'King $44–$88 · West Campus $88' },
  ],
  pre: [
    { lvl: 'Level 1', title: 'Introduction to Water Skills', desc: 'Floating and kicking with support, blowing bubbles, and learning water-safety skills.', prereq: 'No prior experience necessary.', loc: 'King $44–$88 · West Campus $88' },
    { lvl: 'Level 2', title: 'Elementary Water Skills', desc: 'Floating, kicking, and bobbing with support, plus water-safety skills.', prereq: 'Comfort in the water; can kick, float, and blow bubbles with instructor support.', loc: 'King $44–$88 · West Campus $88' },
    { lvl: 'Level 3', title: 'Basic Water Skills', desc: 'Locomotion and treading water independently while learning water-safety skills.', prereq: 'Comfortable kicking, floating, and bubble-blowing without instructor support.', loc: 'King Pool only · $44–$88' },
  ]
};

export const passDefs = [
  { name: 'Daily Ticket', desc: 'One visit, any drop-in program', price: '$7 / $8', sub: 'resident / non-resident', featured: false, link: 'https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/1714098492d96f0cbfeb1874406d4f6b?filter=c2VhcmNoPURyb3AtaW4lMjBQYXNz' },
  { name: '10-Swim Pass', desc: 'Ten visits, best value', price: 'TBD', sub: 'price to confirm', featured: true, link: 'https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu' },
  { name: 'Monthly Pass', desc: 'Unlimited for one month', price: 'TBD', sub: 'price to confirm', featured: false, link: 'https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu' },
  { name: 'Premium Pass', desc: 'Adds Masters & Senior Exercise', price: '$8 / $10', sub: 'resident / non-resident', featured: false, link: 'https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/70e7f81b73ca9c1175358ce14622bdb2?filter=c2VhcmNoPVBSRU1JVU0%3D' },
];
