.PHONY: install dev build lint test clean

install:
	npm install

dev:
	VITE_DEV_MODE=true npm run dev

web:
	npm run dev:web

build:
	npm run build

lint:
	npm run lint

test:
	npm run test

clean:
	rm -rf dist node_modules
