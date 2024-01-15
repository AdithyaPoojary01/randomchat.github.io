// app.js
const socket = io();

let localStream;
let remotePeer;

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localStream = stream;
    document.getElementById('localVideo').srcObject = stream;

    socket.emit('user-connected', socket.id);

    socket.on('start-chat', (remoteUserId) => {
      const peer = new SimplePeer({ initiator: true, stream });

      peer.on('signal', (data) => {
        socket.emit('offer', { offer: data, target: remoteUserId });
      });

      peer.on('stream', (remoteStream) => {
        document.getElementById('remoteVideo').srcObject = remoteStream;
      });

      socket.on('answer', (data) => {
        peer.signal(data.answer);
      });

      remotePeer = peer;
    });
  })
  .catch((error) => {
    console.error('Error accessing media devices:', error);
  });

socket.on('offer', (data) => {
  const peer = new SimplePeer({ stream: localStream });

  peer.on('signal', (offer) => {
    socket.emit('answer', { answer: offer, target: data.sender });
  });

  peer.on('stream', (remoteStream) => {
    document.getElementById('remoteVideo').srcObject = remoteStream;
  });

  peer.signal(data.offer);

  remotePeer = peer;
});

window.addEventListener('beforeunload', () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
  if (remotePeer) {
    remotePeer.destroy();
  }
});
