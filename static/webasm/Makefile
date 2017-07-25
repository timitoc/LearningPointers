editor: *.c
	emcc *.c -O3 -s WASM=1 -o editor.js -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="['_parse']"  --emrun -s ASSERTIONS=2 -Werror -Wall
