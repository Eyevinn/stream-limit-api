To implement
===

### Endpoints

- [x] start
- [x] end
- [x] ping
- [x] kill

### Storage

- [x] key: userId, value: number
- [ x key: userId:deviceId, value: 1
  - [x] ttl > ping, ttl < ping * 2

### Logic

#### start session

- [x] POST /start
- [x] check streams on user key
  - [x] if max, return false
  - [x] else +1
  - [x] add userId:deviceId
  - [x] set ttl > ping
- [x] set listener for expire

#### during session

- [x] POST /ping
- [ ] if device doesn't exist, start session?
- [x] update ttl

#### end session

- [x] POST /end
- [x] expire listener
- [X] iterate down on user sessions
- [X] remove userId:deviceId
