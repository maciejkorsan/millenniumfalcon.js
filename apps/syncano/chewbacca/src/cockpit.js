import Syncano from '@syncano/core'

export default (ctx) => {
  const {channel, response} = new Syncano(ctx)
  const {args} = ctx

  if (args.action === 'started') {
    args.light = 'star'
    args.status = 1
  }

  if (args.action === 'status')  {
    channel.publish(`global-messages`,{cockpit: args.cockpit, front: args.front, hyperdrive: args.hyperdrive })
  }

  
  try {
    channel.publish(`global-messages`, {'light': args.light, 'status': args.status})
    .then(res => {response(JSON.stringify(res), 200, 'application/json')})
  } catch(e) {
    console.log(e)
  }
}