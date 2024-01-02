const webSocket = new WebSocket("ws://localhost:3000");

// data received from server
webSocket.onmessage = (event) => {
  handleSignallingData(JSON.parse(event.data));
};

// setting remote description and ice of remote peer
function handleSignallingData(data) {
  switch (data.type) {
    case "offer":
      peerConn.setRemoteDescription(data.offer);
      createAndSendAnswer();
      break;
    case "candidate":
      peerConn.addIceCandidate(data.candidate);
  }
}

// create, store set offer to local description
function createAndSendAnswer() {
  peerConn.createAnswer(
    (answer) => {
      peerConn.setLocalDescription(answer);
      sendData({
        type: "send_answer",
        answer: answer,
      });
    },
    (error) => {
      console.log(error);
    }
  );
}

// to send data on server
function sendData(data) {
  data.username = username;
  webSocket.send(JSON.stringify(data));
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

document
  .getElementById("join-call")
  .addEventListener("click", function (event) {
    event.preventDefault();
    username = document.getElementById("username-input").value;

    document.getElementById("chat-div").style.display = "inline";

    // open data channel
    dataChannel.onopen = function (event) {
      console.log("Connection opened!");
    };

    // message on data channel
    dataChannel.onmessage = function (event) {
      console.log("Got message: " + event.data);
    };
  });

// send message using data channel
document
  .getElementById("send-message")
  .addEventListener("click", function (event) {
    event.preventDefault();
    dataChannel.send(document.getElementById("your-message").value);
  });
