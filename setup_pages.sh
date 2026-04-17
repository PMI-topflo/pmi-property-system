#!/bin/bash
# PMI Top Florida Properties — Auto Page Setup Script
# Run this from inside your pmi-property-system folder
# Usage: bash setup_pages.sh

echo "🌸 PMI Page Setup — Starting..."

# Check we're in the right folder
if [ ! -d "app" ]; then
  echo "❌ Error: Please run this script from inside your pmi-property-system folder"
  exit 1
fi

# List of all association slugs
SLUGS=(
  "documents"
  "galleriav"
  "abbott"
  "brook"
  "goldkey"
  "kimgarden"
  "manorsxi"
  "venetian1"
  "venetian2"
  "venetian5"
  "venetianrec"
  "serenityiv"
  "lakeview"
  "lafarms"
  "parcview"
  "wedgewoodansin"
  "wedgewood57"
  "shoreland"
  "onebay"
  "fifth"
  "maco"
  "essi"
  "crystalh"
  "delvista"
  "islandhouse"
  "kane"
)

DOWNLOADS=~/Downloads
SUCCESS=0
MISSING=0

for SLUG in "${SLUGS[@]}"; do
  FOLDER="app/$SLUG"
  
  # Create folder if it doesn't exist
  mkdir -p "$FOLDER"
  
  # Look for the downloaded file
  if [ "$SLUG" = "documents" ]; then
    SRC="$DOWNLOADS/documents_page.tsx"
  else
    SRC="$DOWNLOADS/${SLUG}_page.tsx"
  fi
  
  if [ -f "$SRC" ]; then
    cp "$SRC" "$FOLDER/page.tsx"
    echo "✅ $SLUG → app/$SLUG/page.tsx"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "⚠️  Missing: $SRC"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
echo "================================"
echo "✅ Success: $SUCCESS pages"
if [ $MISSING -gt 0 ]; then
  echo "⚠️  Missing files: $MISSING (download them from Claude first)"
fi
echo ""
echo "Next step: Go to GitHub Desktop → Commit → Push"
echo "================================"
