#!/usr/bin/env bash
# Interactive setup for Daily Astronomy Photo. Invoked by install.sh.
# The widget works with NASA's shared DEMO_KEY; a free personal key lifts the
# rate limit. This patches API_KEY in the installed widget.
set -euo pipefail
W="${WIDGET_INSTALL_DIR:-}"

echo "Daily Astronomy Photo uses NASA's APOD API and works out of the box with"
echo "the shared DEMO_KEY (heavily throttled)."
printf "Use your own free NASA API key for higher limits? [y/N] "; read -r a
case "$a" in
  y|Y) ;;
  *) echo "    Using DEMO_KEY."; exit 0 ;;
esac

echo "Get a free key in seconds at https://api.nasa.gov"
printf "Paste your NASA API key: "; read -r k
if [ -z "$k" ]; then echo "    No key entered; using DEMO_KEY."; exit 0; fi
if [ -n "$W" ] && [ -f "$W/index.jsx" ]; then
  sed -i '' "s|^const API_KEY = .*|const API_KEY = \"$k\";|" "$W/index.jsx"
  echo "    Set API_KEY in the installed widget."
else
  echo "    Set API_KEY at the top of index.jsx to: $k"
fi
