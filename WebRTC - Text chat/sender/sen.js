const webSocket = new WebSocket("ws://localhost:3000");

// data received from server
webSocket.onmessage = (event) => {
  handleSignallingData(JSON.parse(event.data));
};

// setting remote description and ice of remote peer
function handleSignallingData(data) {
  switch (data.type) {
    case "answer":
      peerConn.setRemoteDescription(data.answer);
      break;
    case "candidate":
      peerConn.addIceCandidate(data.candidate);
  }
}

// ice configuration
let configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};
let peerConn = new RTCPeerConnection(configuration);
// data channel
dataChannel = peerConn.createDataChannel("channel");

let username;
// store host's username
document
  .getElementById("send-username")
  .addEventListener("click", function (event) {
    event.preventDefault();
    username = document.getElementById("username-input").value;
    sendData({
      type: "store_user",
    });
  });

document
  .getElementById("start-call")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("chat-div").style.display = "inline";

    // store ice candidate on server
    peerConn.onicecandidate = (e) => {
      if (e.candidate == null) return;
      console.log(JSON.stringify(e.candidate));
      sendData({
        type: "store_candidate",
        candidate: e.candidate,
      });
    };

    // open data channel
    dataChannel.onopen = function (event) {
      console.log("Connection opened!");
    };

    // message on data channel
    dataChannel.onmessage = function (event) {
      console.log("Got message: " + event.data);
    };

    createAndSendOffer();
  });

// send message using data channel
document
  .getElementById("send-message")
  .addEventListener("click", function (event) {
    event.preventDefault();
    dataChannel.send(document.getElementById("your-message").value);
  });

// create, store set offer to local description
function createAndSendOffer() {
  peerConn.createOffer(
    (offer) => {
      console.log(JSON.stringify(offer));
      sendData({
        type: "store_offer",
        offer: offer,
      });
      peerConn.setLocalDescription(offer);
    },
    (error) => {
      console.log(error);
    }
  );
}
