downscale.js:
	rm -rf ./dist
	mkdir dist
	( \
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
