# Changelog

All notable changes to Bedlam.

## [0.1.0] - 2026-01-31

### Added
- Isometric grid rendering (20x20 tiles)
- Room system: Reception, GP's Office, Pharmacy, Deflation Room
- Room placement with validation and ghost preview
- Staff system: Doctors, Nurses, Receptionists
- Staff hiring, assignment, and pathfinding
- Patient spawning and AI state machine
- Disease system with diagnosis chains
- Treatment system with success/failure based on skill
- Economy: income from treatments, salary expenses
- Win condition: cure 20 patients
- Lose condition: bankruptcy
- HUD with cash, reputation, time, game speed
- Toolbar for building and hiring
- Info panel for selected entities
- Toast notifications for events
- Pause and game speed controls
- Keyboard shortcuts (1-4, Space, +/-, ESC)
- 65 tests covering core systems

### Technical
- Next.js 14 + TypeScript
- HTML5 Canvas for isometric rendering
- Centralized game loop (no scattered intervals)
- Proper component separation (one per file)
- A* pathfinding implementation
