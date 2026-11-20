# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/cervus-snoopy/zephyr-flint-elm-8p08/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/cervus-snoopy/zephyr-flint-elm-8p08/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI**, built for the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun ($250, 50 places paid). It runs entirely from its own files — open `app/index.html` in desktop Chrome with the network off and it works.

## What it is

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze (28 hidden on PlayStation) — each with its official name, description and grade as PlayStation publishes them, plus its Exophase earn rate.
- **Cited guidance, counted loudly: 162 cited claims, 58 backed by 2+ sources, 11 sources cited, 9 disagreements shown.** Every guide step names the published guides behind it, and the counts are computed live from the guide data and shown in the banner. Where the guides disagree, the disagreement is shown on the trophy and in the Sources view — nothing is presented as settled when the sources are not settled.
- **Tracker** — a checklist saved in the browser (localStorage), with export to a file and import back, filters by grade and kind (story, missable, collectibles, activities, side quests, robberies, combat, exploration, money, completion, misc), search, and a spoiler setting that hides story trophies until they are earned.
- **Count trackers** — the 15 trophies with a number attached (250 stunts, 42 shooting-range gold medals, 14 drone-race locations, 18 meditation spots, $250,000 laundered, …) get a stepper that counts toward the target and ticks the trophy off when it is reached.
- **Six-stage roadmap to the platinum** — built from the official descriptions: which story chapters and missions, which collectibles and counts, in what order, with per-stage progress.
- **Missable watchlist and chapter grid** — three published guides agree only one trophy might be missable (Positive Mental Attitude, the Chapter 1 balcony meditation). The grid shows which trophies must be done by which chapter, and the save discipline that protects a run with no mission replay.
- **Source matrix** — what each of the 11 cited sources backs, and all 9 disagreements between them, including the five trophies whose method no published guide has confirmed yet (those say so plainly instead of guessing).

## Sources

The official list comes from Exophase and PSNProfiles, which agree on every name, description and grade. The methods come from PowerPyx, Push Square, KeenGamer, GamesFuze, GTA Spotter, Vice City Hustle, EGamers, Mobalytics, and Of Zen and Computing — all named beside the claims they back, in the app's Sources view and in `app/data/trophies.json`. Guide text is written in our own words for this guide; no Rockstar logo, artwork or game screenshot is used anywhere.

## Run it

```sh
node serve.ts
# app/ is on http://localhost:8080
```

Or open `app/index.html` directly from any static file server with `app/` at its root. Deep links work: `?view=roadmap`, `?view=missables`, `?view=sources`, `?open=<trophy id>`, `?demo=1` seeds a mid-run save for a quick look.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged from the kit).

## License

MIT. See [LICENSE](LICENSE).
