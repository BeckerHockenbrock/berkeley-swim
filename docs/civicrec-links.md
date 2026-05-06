# Berkeley Public Pools — CivicRec Deep Links (Verified)

Base site: https://rec.berkeleyca.gov  
Main catalog: https://rec.berkeleyca.gov/CA/berkeley-ca/catalog

Verification note:
- The CivicRec catalog loads as the City of Berkeley Recreation Division registration site.
- CivicRec states that class/activity registration is incomplete until payment is received.
- Most useful links are filtered CivicRec catalog/search links, not true one-click checkout URLs.
- CivicRec does not appear to expose stable public "add exact SKU to cart" links.
- For pool passes, the best direct landing page is the King Pool & West Campus Pool Drop-In Pass page.
- For swim lessons, the generic keyword search "Swim Lessons" returns 0 results because "Swim Lessons" behaves more like a category/tag than a searchable program title.
- The encoded Aquatics category link using `category[13301]=1` is broken and should not be used; it currently loads Special Events instead of Aquatics.

---

## Best pool pass landing page

| Use case | URL | Label | Type | Status |
|---|---|---|---|---|
| All regular aquatic passes | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu | King Pool & West Campus Pool Drop-In Pass | Clean pass catalog page | ✅ Confirmed |

Use this for:
- Drop-in swim
- Family Swim
- Lap Swim
- General pool admission

Shows:
- 10 Swims Aquatic Drop-In Pass
- Daily Aquatic Drop-In Pass
- Monthly Aquatic Drop-In Pass

Recommended app link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu

---

## Drop-in / day-pass swim

| Use case | URL | Label | Type | Status |
|---|---|---|---|---|
| Daily pass only | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPURhaWx5IEFxdWF0aWMgRHJvcC1JbiBQYXNz | Daily Aquatic Drop-In Pass | Filtered product search | ✅ Confirmed — direct hit, resident/non-resident variants |
| All aquatic pass options | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu | King Pool & West Campus Pool Drop-In Pass | Clean pass catalog page | ✅ Confirmed |
| Broad drop-in search | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/1714098492d96f0cbfeb1874406d4f6b?filter=c2VhcmNoPURyb3AtaW4lMjBQYXNz | Drop-in Pass search | Broader filtered search | ✅ Works but noisy — includes non-aquatic programs. Avoid as primary link. |

Recommended app link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu

Path:
Catalog → search "Aquatic Drop-in" → King Pool & West Campus Pool Drop-In Pass → choose Daily / 10 Swims / Monthly

---

## Punch passes / multi-visit cards

| Use case | URL | Label | Type | Status |
|---|---|---|---|---|
| 10-visit pass | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPTEwIFN3aW1zIEFxdWF0aWMgRHJvcC1JbiBQYXNz | 10 Swims Aquatic Drop-In Pass | Filtered product search | ✅ Confirmed — direct hit |
| All pass options | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu | King Pool & West Campus Pool Drop-In Pass | Clean pass catalog page | ✅ Confirmed |

Recommended app link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPTEwIFN3aW1zIEFxdWF0aWMgRHJvcC1JbiBQYXNz

---

## Monthly passes / memberships

| Use case | URL | Label | Type | Status |
|---|---|---|---|---|
| Monthly aquatic pass | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPU1vbnRobHkgQXF1YXRpYyBEcm9wLUluIFBhc3M= | Monthly Aquatic Drop-In Pass | Filtered product search | ✅ Confirmed — direct hit |
| Premium pass options | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/70e7f81b73ca9c1175358ce14622bdb2?filter=c2VhcmNoPVBSRU1JVU0%3D | Premium aquatic passes | Broader filtered search | ✅ Confirmed — shows premium Daily, 10-swim, and Monthly options |

Recommended normal monthly link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPU1vbnRobHkgQXF1YXRpYyBEcm9wLUluIFBhc3M=

Recommended premium link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/70e7f81b73ca9c1175358ce14622bdb2?filter=c2VhcmNoPVBSRU1JVU0%3D

---

## Family Swim

No separate CivicRec SKU exists.  
"Family Swim" keyword search returns 0 results — do not use it.  
Route to the aquatic pass link instead.

Recommended link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu

Recommended app wording:
"Family Swim is a drop-in pool time. Buy a Daily, 10-swim, or Monthly Aquatic Drop-In Pass before arriving."

Path:
Catalog → King Pool & West Campus Pool Drop-In Pass → choose Daily / 10 Swims / Monthly

---

## Lap Swim

No separate lap-swim pass exists.  
"Lap Swim" keyword search returns 0 results — do not use it.  
Route to the aquatic pass link.

Recommended link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu

Recommended app wording:
"Lap Swim uses the regular Aquatic Drop-In Pass system."

Path:
Catalog → King Pool & West Campus Pool Drop-In Pass → choose Daily / 10 Swims / Monthly

---

## Senior swim / Senior Exercise

"Senior Exercise" keyword search returns 0 results — do not use it.  
Route to premium passes.

Recommended link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/70e7f81b73ca9c1175358ce14622bdb2?filter=c2VhcmNoPVBSRU1JVU0%3D

Recommended app wording:
"Senior Exercise requires a premium aquatic pass or premium ticket."

Path:
Catalog → search "Premium" → choose premium Daily / 10-swim / Monthly pass

---

## Aqua Zumba / aquatics fitness

| Use case | URL | Label | Type | Status |
|---|---|---|---|---|
| Aqua Zumba | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/1f7a558309d876b0ba8e43b08feb93c2?filter=c2VhcmNoPWFxdWElMjB6dW1iYQ%3D%3D | Aqua Zumba 2026 | Specific class search/result | ✅ Confirmed — $20, live sessions available |

Recommended app link:
https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/1f7a558309d876b0ba8e43b08feb93c2?filter=c2VhcmNoPWFxdWElMjB6dW1iYQ%3D%3D

Path:
Catalog → search "Aqua Zumba" → Aqua Zumba 2026 → choose date/session → register

---

## Swim lessons

Do **not** use the generic "Swim Lessons" keyword search — it returns 0 results.  
Do **not** use the `category[13301]=1` Aquatics category link — it is broken and loads Special Events instead.  
Do **not** use the "Adult Swim Lessons" keyword search — it returns 0 results even though Adult Swim Lessons may appear as a category/button.

| Use case | URL | Label | Type | Status |
|---|---|---|---|---|
| Learn-to-swim classes | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPUxlYXJuLVRvLVN3aW0%3D | Learn-To-Swim search | Filtered search | ✅ Confirmed — shows Learn-To-Swim Level 1–4 at King Pool and West Campus Pool |
| Parent and child aquatics | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPVBhcmVudCUyMGFuZCUyMENoaWxkJTIwQXF1YXRpY3M%3D | Parent and Child Aquatics search | Filtered search | ✅ Confirmed — shows Parent and Child Aquatics classes |
| Main catalog fallback | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog | Main CivicRec catalog | Broad catalog | ✅ Confirmed — user must click Swim Lessons category manually |

Recommended app wording:
"Swim lesson registration is on CivicRec. Use the Learn-To-Swim or Parent and Child Aquatics links when relevant. For adult lessons or if no sessions appear, open the main catalog and choose the Swim Lessons category."

Path:
Catalog → Swim Lessons category → choose Learn-To-Swim / Parent and Child Aquatics / other available lesson category → select pool/date/session → register

---

## Main catalog / fallback

| Use case | URL | Label | Type | Status |
|---|---|---|---|---|
| General CivicRec catalog | https://rec.berkeleyca.gov/CA/berkeley-ca/catalog | City of Berkeley Recreation Division catalog | Broad catalog | ✅ Confirmed |

Use this as the safest fallback when:
- a filtered search link breaks
- lesson sessions are seasonal
- a category is visible in the UI but not linkable through search
- CivicRec changes its filter/category IDs

---

## Links to avoid

| URL / search term | Status | Reason |
|---|---|---|
| `?filter=c2VhcmNoPSZjYXRlZ29yeVsxMzMwMV09MQ==` | ❌ Broken | Intended as Aquatics category, but currently loads Special Events |
| `?filter=...Swim Lessons` | ❌ 0 results | "Swim Lessons" is a category/tag, not a reliable keyword search |
| `?filter=...Adult Swim Lessons` | ❌ 0 results | Adult Swim Lessons appears as a category/button, but the keyword search does not return programs |
| `?filter=...Family Swim` | ❌ 0 results | No separate SKU; use aquatic pass link |
| `?filter=...Lap Swim` | ❌ 0 results | No separate SKU; use aquatic pass link |
| `?filter=...Senior Exercise` | ❌ 0 results | No separate SKU; use premium pass link |
| Broad Drop-in Pass search `1714098...` | ⚠️ Usable but noisy | Includes non-aquatic results above pool passes |

---

# CivicRec URL structure notes

Observed URL patterns:

1. Main catalog:
   https://rec.berkeleyca.gov/CA/berkeley-ca/catalog

2. Filtered catalog:
   https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=<encoded-filter>

3. Filtered catalog with index hash:
   https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/<hash>?filter=<encoded-filter>

The `filter=` parameter is Base64-encoded search/filter state.

Examples:

- `c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu`
  - Decodes to: `search=Aquatic Drop-in`

- `c2VhcmNoPURhaWx5IEFxdWF0aWMgRHJvcC1JbiBQYXNz`
  - Decodes to: `search=Daily Aquatic Drop-In Pass`

- `c2VhcmNoPTEwIFN3aW1zIEFxdWF0aWMgRHJvcC1JbiBQYXNz`
  - Decodes to: `search=10 Swims Aquatic Drop-In Pass`

- `c2VhcmNoPU1vbnRobHkgQXF1YXRpYyBEcm9wLUluIFBhc3M=`
  - Decodes to: `search=Monthly Aquatic Drop-In Pass`

- `c2VhcmNoPVBSRU1JVU0%3D`
  - URL-decoded then Base64-decoded: `search=PREMIUM`

- `c2VhcmNoPWFxdWElMjB6dW1iYQ%3D%3D`
  - URL-decoded then Base64-decoded: `search=aqua zumba`

- `c2VhcmNoPUxlYXJuLVRvLVN3aW0%3D`
  - URL-decoded then Base64-decoded: `search=Learn-To-Swim`

- `c2VhcmNoPVBhcmVudCUyMGFuZCUyMENoaWxkJTIwQXF1YXRpY3M%3D`
  - URL-decoded then Base64-decoded: `search=Parent and Child Aquatics`

Important reliability notes:
- Search-based links are more reliable than category-ID links.
- Category IDs can change or point somewhere unexpected.
- The `/index/<hash>` values currently work, but should be monitored seasonally.
- Avoid constructing links from category IDs unless verified live.
- Best strategy for the app: store manually verified CivicRec links in a small config file and re-check them when the City publishes a new pool schedule or registration season.

---

# Recommended production link config

```js
export const civicRecLinks = {
  mainCatalog:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog",

  aquaticPasses:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/7ec2b23b01b628e9258b3f19e80b33d0?filter=c2VhcmNoPUFxdWF0aWMlMjBEcm9wLWlu",

  dailyAquaticPass:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPURhaWx5IEFxdWF0aWMgRHJvcC1JbiBQYXNz",

  tenSwimPass:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPTEwIFN3aW1zIEFxdWF0aWMgRHJvcC1JbiBQYXNz",

  monthlyAquaticPass:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPU1vbnRobHkgQXF1YXRpYyBEcm9wLUluIFBhc3M=",

  premiumAquaticPasses:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/70e7f81b73ca9c1175358ce14622bdb2?filter=c2VhcmNoPVBSRU1JVU0%3D",

  aquaZumba:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog/index/1f7a558309d876b0ba8e43b08feb93c2?filter=c2VhcmNoPWFxdWElMjB6dW1iYQ%3D%3D",

  learnToSwim:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPUxlYXJuLVRvLVN3aW0%3D",

  parentChildAquatics:
    "https://rec.berkeleyca.gov/CA/berkeley-ca/catalog?filter=c2VhcmNoPVBhcmVudCUyMGFuZCUyMENoaWxkJTIwQXF1YXRpY3M%3D"
};
```
