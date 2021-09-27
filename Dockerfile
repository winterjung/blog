FROM node:14.17.6-buster

WORKDIR /app

ADD package.json package.json
ADD package-lock.json package-lock.json

RUN npm ci

ENV GATSBY_TELEMETRY_DISABLED 1
ENV PATH /app/node_modules/.bin:$PATH

ADD src src
ADD static static
ADD gatsby-*.js ./

EXPOSE 8000
EXPOSE 9000

CMD ["gatsby", "develop", "-H", "0.0.0.0"]
