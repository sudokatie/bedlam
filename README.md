# Bedlam

Browser-based hospital management in the spirit of Theme Hospital. Build rooms. Hire staff. Try not to kill anyone.

## Why This Exists

Theme Hospital was a masterpiece of 90s game design. Silly diseases. Stressed doctors. Patients dying in waiting rooms because you forgot to build a second pharmacy.

This is my attempt to capture that chaos in a browser. No Unity. No game engine. Just Canvas, some isometric tiles, and the eternal struggle of keeping everyone alive long enough to pay their treatment bills.

## Features

- Isometric hospital building (it's not 3D but it'll fool your brain)
- 4 room types: Reception, GP's Office, Pharmacy, Deflation Room
- 3 staff types: Doctors, Nurses, Receptionists
- 3 silly diseases: Bloaty Head, Slack Tongue, Invisibility
- Patient AI that gets increasingly impatient
- Treatment success rates based on staff skill
- Economy that will bankrupt you if you're not careful
- Win by curing 20 patients. Lose by running out of money.
- Retro synthesized sound effects
- Local leaderboard tracks your best hospitals

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and start building your hospital empire.

## Controls

| Key | Action |
|-----|--------|
| 1-4 | Select room type |
| Space | Pause/unpause |
| +/- | Game speed |
| ESC | Cancel action |
| Click | Place room / Select staff |
| Right-click | Cancel |

## Gameplay Loop

1. Build a Reception (patients need somewhere to check in)
2. Hire a Receptionist (the desk won't staff itself)
3. Build a GP's Office (diagnosis happens here)
4. Hire a Doctor (assign them to the GP's Office)
5. Build treatment rooms for the diseases you're seeing
6. Try to cure 20 patients before going bankrupt

Patients arrive, wait impatiently, get diagnosed, get treated (hopefully), and leave (hopefully cured). Every death hurts your reputation. Every cure earns money.

## The Diseases

| Disease | Diagnosis | Treatment |
|---------|-----------|-----------|
| Bloaty Head | GP only | Deflation Room |
| Slack Tongue | GP only | Pharmacy |
| Invisibility | GP + Pharmacy | Pharmacy |

Yes, Invisibility requires a blood test at the Pharmacy to diagnose. Don't ask why. It's medical science.

## Sound Effects

Web Audio API synthesized sounds for that retro feel:
- Patient cured (victory arpeggio)
- Patient death (sad descending tone)
- Room built (construction thud)
- Staff hired (pleasant chime)
- Patient arriving (door bell)
- Cash received (coin sound)
- Game won/lost (fanfares)

## Tech Stack

- Next.js 14 + TypeScript
- HTML5 Canvas (isometric rendering)
- Tailwind CSS (UI chrome)
- 78 tests (the bits that matter)

## Architecture

One component per file. One module per concern. The game loop lives in `loop.ts`. Rendering lives in `render.ts`. The UI components are separate. The game state flows through React state. It's clean. Probably.

## License

MIT

## Author

Katie

---

*No patients were harmed in the making of this game. Several virtual ones, however, met unfortunate ends due to understaffing.*
