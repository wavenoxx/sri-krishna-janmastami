#!/bin/bash
# Assembles the single-file experience from src/ into index.html (and gokulam.html).
set -e
cd "$(dirname "$0")"
cat src/part2_core.mjs src/part3b_gokulam.mjs src/part3_world.mjs src/part4_flow.mjs > .tmp_gokulam_app.mjs
node --check .tmp_gokulam_app.mjs
{ cat src/part1_head.html; cat .tmp_gokulam_app.mjs; printf '</script>\n</body>\n</html>\n'; } > index.html
rm -f .tmp_gokulam_app.mjs
cp index.html gokulam.html
# local-three copy for the headless tests (npm install three@0.185.1 inside test/ first)
sed 's#https://cdnjs.cloudflare.com/ajax/libs/three.js/0.185.1/three.module.min.js#/node_modules/three/build/three.module.js#' index.html > test/index.html
echo "built index.html ($(wc -c < index.html) bytes)"
