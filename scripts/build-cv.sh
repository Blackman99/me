#!/usr/bin/env bash
# Renders scripts/cv.html to static/Dongsheng-Zhao-CV.pdf using headless Chrome.
# Re-run this after editing the CV; the PDF is committed so CI needs no browser.
set -euo pipefail

cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME (set \$CHROME)" >&2; exit 1; }

"$CHROME" \
	--headless \
	--disable-gpu \
	--no-pdf-header-footer \
	--print-to-pdf="$PWD/static/Dongsheng-Zhao-CV.pdf" \
	"file://$PWD/scripts/cv.html" 2>/dev/null

echo "wrote static/Dongsheng-Zhao-CV.pdf"
