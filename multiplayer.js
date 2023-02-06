var lastPeerId = null;
var peer = null; // Own peer object
var peerId = null;
var conn = null;


var status = location.href.split("?")[1],
    host = status.includes("host"),
    joining = (status.includes("join"))?status.split("=")[1]:false


function initialize() {
  // Create own peer object with connection to shared PeerJS server
  peer = new Peer(null, {
    debug: 2,
  });

  peer.on("open", function (id) {
    // Workaround for peer.reconnect deleting previous id
    if (peer.id === null) {
      console.log("Received null id from peer open");
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id;
    }

    console.log("ID: ", peer.id);
    console.log("Awaiting connection...");
    if (joining) {
        join(joining)
    }
  });
  peer.on("connection", function (c) {
    // Allow only a single connection
    if (conn && conn.open) {
      c.on("open", function () {
        c.send("Already connected to another client");
        setTimeout(function () {
          c.close();
        }, 500);
      });
      return;
    }

    conn = c;
    console.log("Connected to: " + conn.peer);
    ready();
  });
  peer.on("disconnected", function () {
    console.log("Connection lost. Please reconnect");

    // Workaround for peer.reconnect deleting previous id
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect();
  });
  peer.on("close", function () {
    conn = null;
    console.log("Connection destroyed");
  });
  peer.on("error", function (err) {
    console.log(err);
    alert("" + err);
  });
}

function ready() {
  conn.on("data", function (data) {
    receiveMultiplayerData(data)
  });
  conn.on("close", function () {
    conn = null;
  });
}

function join(id) {
  // Close old connection
  if (conn) {
    conn.close();
  }

  // Create connection to destination peer specified in the input field
  conn = peer.connect(id, {
    reliable: true,
  });

  conn.on("open", function () {
    console.log("Connected to: " + conn.peer);

    // Check URL params for comamnds that should be sent immediately
    var command = getUrlParam("command");
    if (command) conn.send(command);
  });
  // Handle incoming data (messages only since this is the signal sender)
  conn.on("data", function (data) {
    //console.log("data", data);
    receiveMultiplayerData(data)
  });
  conn.on("close", function () {});
}

function getUrlParam(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null) return null;
  else return results[1];
}

document.body.onload = ()=>{
    setTimeout(() => {
        mulitPlayerInit()
    }, 1000);
}

function getMultiplayerData() {
   
    return JSON.stringify({
        position:player.body.position,
        velocity:player.body.velocity,
        keys:keys,
    })
}

function mulitPlayerInit() {
    initialize()

    var multiPlayerBodies = Matter.Composite.create()
    Matter.Composite.add(engine.world, multiPlayerBodies)
    

    if (host) {
        window.enemeyPlayer = new PlayerController(engine,{
            body:{
                scale:15,
                density:0.01,
            },

            speed:0.6,
        })
        window.enemeyKeys = {}
    }
}



function receiveMultiplayerData(data) {
    data = JSON.parse(data)
    console.log(window.enemeyPlayer, data)
    Matter.Body.setPosition(window.enemeyPlayer.body, data.position)
    Matter.Body.setVelocity(window.enemeyPlayer.body, data.velocity)
    window.enemeyKeys = data.keys
}

function multiplayerClientLoop() {
    conn.send(window.getMultiplayerData())
    setTimeout(() => {
        //multiplayerClientLoop()
    }, 1000/15);
}