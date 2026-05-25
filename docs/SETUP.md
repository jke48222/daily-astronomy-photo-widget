# daily-astronomy-photo — Setup

> NASA Astronomy Picture of the Day.

## Install (one click)

1. Install [Übersicht](https://tracesof.net/uebersicht/) and run it once.
2. Double-click `install.command` (or run `./install.sh` in Terminal).
   It copies `daily-astronomy-photo.widget` into your Übersicht widgets folder, installs any
   helpers, and walks you through any configuration.

The installer is safe to re-run; it just refreshes the install in place.
To install by hand instead, unzip `daily-astronomy-photo.widget.zip` into
`~/Library/Application Support/Übersicht/widgets/`.

## Configuration

Works with no setup using NASA's public `DEMO_KEY`. For higher rate limits, get
a free key at https://api.nasa.gov and set `API_KEY` at the top of `index.jsx`.

## Fonts

For the intended look, install **Instrument Serif**, **Geist**, and
**Geist Mono**. System fonts are used as a fallback otherwise.
