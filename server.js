const http = require('http');
const fs = require('fs');

const { Player } = require('./game/class/player');
const { World } = require('./game/class/world');

const worldData = require('./game/data/basic-world-data');

let player;
let world = new World();
world.loadWorld(worldData);

const server = http.createServer((req, res) => {

  /* ============== ASSEMBLE THE REQUEST BODY AS A STRING =============== */
  let reqBody = '';
  req.on('data', (data) => {
    reqBody += data;
  });

  req.on('end', () => { // After the assembly of the request body is finished
    /* ==================== PARSE THE REQUEST BODY ====================== */
    if (reqBody) {
      req.body = reqBody
        .split("&")
        .map((keyValuePair) => keyValuePair.split("="))
        .map(([key, value]) => [key, value.replace(/\+/g, " ")])
        .map(([key, value]) => [key, decodeURIComponent(value)])
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    }

    /* ======================== ROUTE HANDLERS ========================== */
    // Phase 1: GET /
    if(req.method === 'GET' && req.url === '/') {
      let template = fs.readFileSync('./views/new-player.html', 'utf-8');
      let page = template.replace(/#{availableRooms}/g, world.availableRoomsToString());

      res.statusCode = 200;
      res.setHeader('content-type', 'text/html');
      return res.end(page);
    }

    // Phase 2: POST /player
    if(req.method === 'POST' && req.url === '/player'){
      let playerName = req.body.name;
      let room = world.rooms[req.body.roomID];
      player = new Player(req.body.name, room);

      res.statusCode = 302;
      res.setHeader('location', '/rooms/' + req.body.roomID);
      return res.end;

    }

    // Phase 3: GET /rooms/:roomId

    // Phase 4: GET /rooms/:roomId/:direction

    // Phase 5: POST /items/:itemId/:action

    // Phase 6: Redirect if no matching route handlers
  })
});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));
