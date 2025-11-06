#!/usr/bin/env bash
BROWSER="google-chrome"
BASE="$HOME/.config/multi-browser-test"
mkdir -p "$BASE"

NUM=10
for i in $(seq 1 $NUM); do
  PROFILE="$BASE/profile-$i"
  mkdir -p "$PROFILE"
  "$BROWSER" \
    --user-data-dir="$PROFILE" \
    --no-first-run \
    --disable-extensions \
    --disable-sync \
    --disable-gpu \
    --disable-notifications \
    --disable-features=PushMessaging,BackgroundMode,CloudMessaging \
    --no-default-browser-check \
    --no-service-autorun \
    &
  sleep 0.2
done
1