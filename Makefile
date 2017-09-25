NAME := $(shell node -e 'process.stdout.write(require("./package.json").name)')
VERSION := $(shell node -e 'process.stdout.write(require("./package.json").version)')
DESC := $(shell node -e 'process.stdout.write(require("./package.json").description)')
AUTHOR := $(shell node -e 'process.stdout.write(require("./package.json").author.name)')
EMAIL := $(shell node -e 'process.stdout.write(require("./package.json").author.email)')
HOME := $(shell node -e 'process.stdout.write(require("./package.json").homepage)')
LICENSE := $(shell node -e 'process.stdout.write(require("./package.json").license)')

build:
	@echo "Building dist"
	@rm -rf ./dist
	@mkdir dist
	@( \
		printf "/* ${NAME} ${VERSION}\n"; \
		printf "   ${DESC}\n"; \
		printf "   ${HOME}\n"; \
		printf "   ${AUTHOR} <${EMAIL}>\n"; \
		printf "   Under ${LICENSE} license\n"; \
		printf "*/\n"; \
		printf "(function (root, factory) {\n"; \
		printf "    if (typeof define === 'function' && define.amd) {\n"; \
		printf "        define([], factory);\n"; \
		printf "    } else if (typeof module === 'object' && module.exports) {\n"; \
		printf "        module.exports = factory();\n"; \
		printf "    } else {\n"; \
		printf "        root.downscale = factory();\n"; \
		printf "    }\n"; \
		printf "}(this, function () {\n\n"; \
		cat src/*.js; \
		printf "    return downscale\n"; \
		printf "}));"; \
	) \
	> dist/downscale.js
	@echo "DONE"

postpublish:
	git add package.json
	git commit -m 'Version ${VERSION}'
	git tag -a ${VERSION} -m 'Version ${VERSION}'
	git push && git push --tags
