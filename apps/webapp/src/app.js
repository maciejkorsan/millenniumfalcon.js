import axios from 'axios'

const hyperdrive = document.querySelector('.-hyperdrive')
const cockpit = document.querySelector('.-cockpit')
const headlights = document.querySelector('.-headlights')
const hyperdriveLight = document.querySelector('.-hyperdrive.falcon__light')
const cockpitLight = document.querySelector('.-cockpit.falcon__light')
const headlightsLight = document.querySelector('.-headlights.falcon__light')

let lights = {
  cockpit: 0,
  front: 0,
  hyperdrive: 0
};

const syncanoInstance = process.env.SYNCANO_INSTANCE

const wsUrl = `wss://api.syncano.io/v2/instances/${syncanoInstance}/endpoints/sockets/chewbacca/global-messages/?transport=websocket`



const setLights = (lights) => {
  if (lights.front === 1) {
    if (!headlightsLight.classList.contains('-active'))
    headlightsLight.classList.add('-active')
  } else {
    if (headlightsLight.classList.contains('-active'))
    headlightsLight.classList.remove('-active')
  }
  if (lights.cockpit === 1) {
    if (!cockpitLight.classList.contains('-active'))
    cockpitLight.classList.add('-active')
  } else {
    if (cockpitLight.classList.contains('-active'))
    cockpitLight.classList.remove('-active')
  }
  if (lights.hyperdrive === 1) {
    if (!hyperdriveLight.classList.contains('-active'))
    hyperdriveLight.classList.add('-active')
  } else {
    if (hyperdriveLight.classList.contains('-active'))
    hyperdriveLight.classList.remove('-active')
  }
}


axios.get(`https://${syncanoInstance}.syncano.space/chewbacca/cockpit/?light=getStatus`)


const init = () => {
  const ws = new WebSocket(wsUrl)
  ws.onmessage = function (event) {
    const data = JSON.parse(event.data)
    console.log(data.payload)
    if (data.payload.hasOwnProperty('cockpit')) {
      console.log(new Date())
      lights = data.payload
      setLights(lights) 
    }
  }
  ws.onclose = function() {
    console.log("Connection closed 🚨 Reconnecting 🔄")
    const reconnect = () => {
      init()
    }
    setTimeout(reconnect, 1000)
  };
}

init()




hyperdrive.addEventListener('click', (e) => {
  axios.get(`https://${syncanoInstance}.syncano.space/chewbacca/cockpit/?light=hyperdrive&status=1`)
})

cockpit.addEventListener('click', (e) => {
  axios.get(`https://${syncanoInstance}.syncano.space/chewbacca/cockpit/?light=cockpit&status=${lights.cockpit ? 0 : 1}`)
})

headlights.addEventListener('click', (e) => {
  axios.get(`https://${syncanoInstance}.syncano.space/chewbacca/cockpit/?light=front&status=${lights.front ? 0 : 1}`)
})




// disabling zooming on ios
document.documentElement.addEventListener('touchmove', function (event) {
  event.preventDefault();      
}, false);


var lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  var now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);