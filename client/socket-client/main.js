// Importera 'io' från socket.io-client-biblioteket
import { io } from 'socket.io-client';

//Skapa en socket-anslutning till servern
const socket = io('http://localhost:3000');

let sendMessage = document.querySelector('#sendMessage');
let sendBtn = document.querySelector('#sendBtn');
let chatList = document.querySelector('#chatList');
let createRoomBtn = document.querySelector('#createRoomBtn');
let roomNameInput = document.querySelector('#roomName');
let roomList = document.querySelector('#roomList');
let chatSection = document.querySelector('#chatSection');

let currentRoom = null;

createRoomBtn.addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();
  if (roomName !== '') {
    currentRoom = roomName;
    socket.emit('joinRoom', currentRoom);
    chatSection.style.display = 'block';
  }
});

sendBtn.addEventListener('click', () => {
  if (currentRoom) {
    const message = sendMessage.value;
    socket.emit('chat', { room: currentRoom, message });
    sendMessage.value = '';
  }
});

socket.on('chat', (data) => {
  console.log('socket', data);
  updateChat(data);
});

socket.on('roomList', (rooms) => {
  console.log('socket', rooms);
  updateRoomList(rooms);
});

function updateRoomList(rooms) {
  roomList.innerHTML = '';
  rooms.forEach((room) => {
    let li = document.createElement('li');
    li.innerText = room;
    roomList.appendChild(li);
  });
}

// Uppdatera chattlistan med nya meddelanden
function updateChat(data) {
  // li skapas för varje meddelande
  let li = document.createElement('li');
  li.innerText = `${data.userId} - ${data.message}`;
  chatList.appendChild(li);
}
