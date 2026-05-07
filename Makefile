.PHONY: help web dev web-dev web-build web-lint parser-test

WEB_DIR := web
HOST := 0.0.0.0
PORT := 3000

help:
	@echo "Berkeley Swim commands"
	@echo ""
	@echo "  make web          Run the website for Codespaces on port $(PORT)"
	@echo "  make dev          Alias for make web"
	@echo "  make web-build    Build the Next.js app"
	@echo "  make web-lint     Lint the Next.js app"
	@echo "  make parser-test  Run Java parser tests"

web: web-dev

dev: web-dev

web-dev:
	cd $(WEB_DIR) && npm run dev -- --hostname $(HOST) --port $(PORT)

web-build:
	cd $(WEB_DIR) && npm run build

web-lint:
	cd $(WEB_DIR) && npm run lint

parser-test:
	cd parser && ./gradlew test
