#!/usr/bin/env bash
# Renders the CV sources to PDFs in static/ using headless Chrome.
# Re-run after editing either HTML; the PDFs are committed so CI needs no browser.
set -euo pipefail

cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME (set \$CHROME)" >&2; exit 1; }

render() {
	local src="$1" out="$2"
	"$CHROME" \
		--headless \
		--disable-gpu \
		--no-pdf-header-footer \
		--print-to-pdf="$PWD/static/$out" \
		"file://$PWD/scripts/$src" 2>/dev/null
	echo "wrote static/$out"
}

render cv.html Dongsheng-Zhao-CV.pdf
render cv.zh.html Dongsheng-Zhao-CV-zh.pdf
