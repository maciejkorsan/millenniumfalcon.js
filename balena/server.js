const WebSocket = require("ws");

const axios = require('axios')

const { spawn } = require("child_process");

const play = file => {
  spawn("aplay", [`audio/${file}.wav`]);
};

const gpio = require("onoff").Gpio;
const hyperdrive = new gpio(3, "out");
const frontLeft = new gpio(14, "out");
const frontRight = new gpio(16, "out");
const cockpit = new gpio(15, "out");

hyperdrive.writeSync(0)
let hyperdriveTimer = {}
const socketUrl = process.env.websocket
const syncanoUrl = process.env.syncano


const lights = {
  cockpit: 0,
  front: 0,
  hyperdrive: 0
};

function updateStatus(light, status) {
  lights[light] = status
  axios.post(syncanoUrl, {
    action: 'status',
    ...lights
  })
}


const init = () => {

let ws = new WebSocket(socketUrl)

ws.on("open", function open() {
  console.log("Connected 🚀")
});

ws.on("message", function incoming(data) {
    const parsed = JSON.parse(data)
    const message = parsed.payload
    const light = message.light
    const status = parseInt(message.status)

    if (light === "getStatus") {
      axios.post(syncanoUrl, {
        action: 'status',
        ...lights
      })
    }

    if (light === "star") {
      hyperdrive.writeSync(1)
      updateStatus("hyperdrive", 1)
      try {
        clearTimeout(hyperdriveTimer)
      } catch (e) {}
      console.log("star")
      hyperdriveTimer = setTimeout(function() {
        hyperdrive.writeSync(0)
        updateStatus("hyperdrive", 0)
      }, 3000)
      play("r2d2")
    }

    if (light === "hyperdrive") {
      hyperdrive.writeSync(status)
      updateStatus("hyperdrive", 1)
      try {
        clearTimeout(hyperdriveTimer)
      } catch (e) {}
      hyperdriveTimer = setTimeout(function() {
        hyperdrive.writeSync(0)
        updateStatus("hyperdrive", 0)
      }, 10000)
      console.log("hyperdrive")
      play("engine")
    }
    if (light === "front") {
      lights.front = lights.front ? 0 : 1
      frontLeft.writeSync(lights.front)
      frontRight.writeSync(lights.front)
      updateStatus("front", lights.front)
      console.log("front lights")
    }
    if (light === "cockpit") {
      lights.cockpit = lights.cockpit ? 0 : 1
      cockpit.writeSync(lights.cockpit)
      console.log("cockpit")
      updateStatus("cockpit", lights.cockpit)
      if (lights.cockpit === 1) play("chewy_roar")
    }
    
  }
)



ws.on("error", function(error) {
  console.log("Connection error: " + error.toString())
  ws = new WebSocket(socketUrl)
});

ws.on("close", function() {
  console.log("Connection closed 🚨 Reconnecting 🔄")
  const reconnect = () => {
    init()
  }
  setTimeout(reconnect, 1000)
});
}

init()


/*
client.on("connect", function(connection) {

 

  console.log("WebSocket Client Connected");
  connection.on("error", function(error) {
    console.log("Connection Error: " + error.toString());
    client.connect(socketUrl);
  });
  connection.on("close", function() {
    console.log("echo-protocol Connection Closed");
    client.connect(socketUrl);
  });
  connection.on("message", function(response) {
   
  });
});

*/
