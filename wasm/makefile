.PHONY: build dev clean

build:
	GOOS=js GOARCH=wasm go build -o ../public/go.wasm main.go
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" ../public/

dev: build

clean:
	rm -f ../public/go.wasm ../public/wasm_exec.js
