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

let localStream;
document
  .getElementById("start-call")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("video-call-div").style.display = "inline";

    navigator.getUserMedia(
      {
        video: true,
        audio: true,
      },
      (stream) => {
        localStream = stream;
        document.getElementById("local-video").srcObject = localStream;

        // add local stream to RTC
        peerConn.addStream(localStream);

        // add remote peer
        peerConn.onaddstream = (e) => {
          document.getElementById("remote-video").srcObject = e.stream;
        };

        // store ice candidate on server
        peerConn.onicecandidate = (e) => {
          if (e.candidate == null) return;
          console.log(JSON.stringify(e.candidate));
          sendData({
            type: "store_candidate",
            candidate: e.candidate,
          });
        };

        createAndSendOffer();
      },
      (error) => {
        console.log(error);
      }
    );
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

// audio video mute
let isAudio = true;
document
  .getElementById("mute-audio")
  .addEventListener("click", function (event) {
    event.preventDefault();
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
    isAudio
      ? (document.getElementById("mute-audio").style.textDecoration = "none")
      : (document.getElementById("mute-audio").style.textDecoration =
          "line-through");
  });

let isVideo = true;
document
  .getElementById("mute-video")
  .addEventListener("click", function (event) {
    event.preventDefault();
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
    isVideo
      ? (document.getElementById("mute-video").style.textDecoration = "none")
      : (document.getElementById("mute-video").style.textDecoration =
          "line-through");
  });

function endCall() {
  location.reload();
}
