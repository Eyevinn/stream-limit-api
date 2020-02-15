# Stream Limit API

Example of a simple implementation to build a stream limit api on top of Redis

#### Related repositories

- [Favorites API](https://github.com/Eyevinn/favorites-api)
- [Ratings API](https://github.com/Eyevinn/ratings-api)
- [Continue Watching API](https://github.com/Eyevinn/continue-watching-api)

## Requirements

- nodejs v10+
- redis

## Usage
- `git clone git@github.com:Eyevinn/stream-limit-api.git`
- `cd stream-limit-api`
- `npm install`
- Start Redis locally or insert the needed keys into the .env file
- `npm start` to run the server

## Endpoints

- POST `/:userId/start/:deviceId` To start a session
- POST `/:userId/ping/:deviceId` To keep the session alive
- POST `/:userId/end/:deviceId` To end a session
- POST `/:userId/kill/:deviceId` To kill a session
- GET `/:userId/list` To get a user's ongoing sessions

## Environment variables

- `NODE_ENV` if set to `development` there will be some logging made into the console
- `REDIS_URL` if not local
- `REDIS_PORT` if not default (6379)
- `REDIS_AUTH`
- `STREAM_LIMIT` To set the limitation in maximum amount of sessions per user (default 2)

## Docker

A `docker-compose` config file is provided that takes care of building the image and running this container together with a Redis db container.

Start the service:

- `docker-compose up`

Stop the service:

- `docker-compose down`

The Redis container is using `/tmp` as persistant storage but this can be changed by modifying the `docker-compose.yml` file. Change:

```
    volumes:
      - /tmp:/bitnami/redis/data
```

to where you want the persistant storage to be located.
