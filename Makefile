.PHONY: install dev build lint test clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

test:
	npm run test

clean:
	rm -rf dist node_modules
