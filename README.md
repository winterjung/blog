# blog
> https://blog.winterjung.dev

## For development

```sh
$ docker build . -t blog
$ docker run --rm --name blog -p 8000:8000 \
    -v $(pwd)/src:/app/src \
    -v $(pwd)/static:/app/static \
    -v $(pwd)/gatsby-config.js:/app/gatsby-config.js \
    -v $(pwd)/gatsby-node.js:/app/gatsby-node.js \
    blog
$ open http://localhost:8000/
```

## For production

```sh
$ docker build . -t blog
$ docker run --rm --name blog -p 9000:9000 \
    -v $(pwd)/public:/app/public \
    blog /bin/bash -c 'gatsby build && gatsby serve -H 0.0.0.0'
$ open http://localhost:9000/
```
