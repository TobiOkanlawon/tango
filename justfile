dev:
	bun index.ts

update:
	bun build --compile --target=bun-linux-x64 ./index.ts --outfile bin/tango
