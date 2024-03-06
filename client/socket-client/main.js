// Importera 'io' från socket.io-client-biblioteket
import { io } from 'socket.io-client';

//Skapa en socket-anslutning till servern
const socket = io('http://localhost:3000');

let signupForm = document.querySelector('#signupForm');
let sendMessage = document.querySelector('#sendMessage');
let sendBtn = document.querySelector('#sendBtn');
let chatList = document.querySelector('#chatList');
let createRoomBtn = document.querySelector('#createRoomBtn');
let roomNameInput = document.querySelector('#roomName');
let roomList = document.querySelector('#roomList');
let chatSection = document.querySelector('#chatSection');


let currentRoom = null; // Variabel för att hålla reda på det aktuella rummet

function printSignup() {
  if (localStorage.getItem('user')) {
    signupForm.style.display = 'none';
    return;
  }
  signupForm.innerHTML = '';

  let signupName = document.createElement('input');
  signupName.placeholder = 'Name';
  let signupPassword = document.createElement('input');
  signupPassword.type = 'password';
  signupPassword.placeholder = 'Password';
  let signupBtn = document.createElement('button');
  signupBtn.innerText = 'Sign Up';

  signupBtn.addEventListener('click', () => {
    let sendNewUser = {
      name: signupName.value,
      password: signupPassword.value,
    };
    fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendNewUser),
    })
    .then((res) => res.json())
    .then((data) => {
      alert('User created successfully!')

      signupName.value = '';
      signupPassword.value = '';
      
      console.log(data);
    })
  })
  signupForm.append(signupName, signupPassword, signupBtn);
}

printSignup();

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


// ------------------------ REGISTER NEW USER -------------------------------- //

document.addEventListener('DOMContentLoaded', () => {
  const registrationForm = document.getElementById('newUser');
  const loginForm = document.getElementById('loginForm');

  if (registrationForm) {
      registrationForm.addEventListener('submit', (event) => {
          event.preventDefault();

          const username = document.getElementById('regUsername').value;
          const password = document.getElementById('regPassword').value;
          const user = {
              username: username,
              password: password
          };

          saveUser(user);
          registrationForm.reset();
      });
  }

  function saveUser(user) {
      if (localStorage) {
          const userData = JSON.stringify(user);
          localStorage.setItem('user', userData);
          console.log('User saved successfully');
      } else {
          console.log('Error!');
      }
  }
});