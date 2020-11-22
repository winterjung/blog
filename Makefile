.PHONY: build
build:
	docker build . -t blog

.PHONY: stop
stop:
	docker stop blog

.PHONY: develop
develop: build
	docker run --rm --name blog -p 8000:8000 \
		-v $$(pwd)/src:/app/src \
		-v $$(pwd)/static:/app/static \
		-v $$(pwd)/gatsby-config.js:/app/gatsby-config.js \
		-v $$(pwd)/gatsby-node.js:/app/gatsby-node.js \
		blog

.PHONY: developd
developd: build
	docker run --rm --name blog -p 8000:8000 \
		-v $$(pwd)/src:/app/src \
		-v $$(pwd)/static:/app/static \
		-v $$(pwd)/gatsby-config.js:/app/gatsby-config.js \
		-v $$(pwd)/gatsby-node.js:/app/gatsby-node.js \
		-d blog

.PHONY: serve
serve: build
	docker run --rm --name blog -p 9000:9000 \
		-v $$(pwd)/public:/app/public \
		blog /bin/bash -c 'gatsby build && gatsby serve -H 0.0.0.0'

.PHONY: served
served: build
	docker run --rm --name blog -p 9000:9000 \
		-v $$(pwd)/public:/app/public \
		-d blog /bin/bash -c 'gatsby build && gatsby serve -H 0.0.0.0'
