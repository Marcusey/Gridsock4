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

let currentRoom = null; // Variabel för att hålla reda på det aktuella rummet

// Lägg till en händelselyssnare för att skapa ett rum när knappen klickas på
createRoomBtn.addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();
  if (roomName !== '') {
    currentRoom = roomName; // Sätt det aktuella rummet
    socket.emit('joinRoom', currentRoom); // Skicka meddelande till servern om att ansluta till rummet
    chatSection.style.display = 'block'; // Visa chatten på användargränssnittet
  }
});

sendBtn.addEventListener('click', () => {
  if (currentRoom) {
    const message = sendMessage.value;
    // Skicka chattmeddelande till servern
    socket.emit('chat', { room: currentRoom, message });
    sendMessage.value = ''; // Återställ inputfältet
  }
});

// Uppdaterar chattlistan när ett chattmeddelande tas emot från servern
socket.on('chat', (data) => {
  console.log('socket', data);
  updateChat(data);
});

// Uppdaterar rumlistan när information om aktiva rum tas emot från servern
socket.on('roomList', (rooms) => {
  console.log('socket', rooms);
  updateRoomList(rooms);
});

// Funktion för att uppdatera rumlistan på användargränssnittet
function updateRoomList(rooms) {
  roomList.innerHTML = '';
  rooms.forEach((room) => {
    let li = document.createElement('li');
    li.innerText = room;
    roomList.appendChild(li);
  });
}

// Funktion för att uppdatera chattlistan på användargränssnittet
function updateChat(data) {
  // Skapa en li för varje meddelande
  let li = document.createElement('li');

  // Om det är ett meddelande om att en användare har lämnat chatten
  if (data.message.includes('left the room')) {
    // Använd röd färg för meddelandet om användaren lämnar
    li.innerHTML = `<span style="color: ${data.color};">${data.userId}</span> - <span style="color: red;">${data.message}</span>`;
  } else {
    // Annars, använd användarens färg för användarens ID och svart för meddelandetexten
    li.innerHTML = `<span style="color: ${data.color};">${data.userId}</span> - ${data.message}`;
  }

  // Visa meddelandet på användargränssnittet
  chatList.appendChild(li);
}