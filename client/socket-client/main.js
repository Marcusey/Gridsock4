// Importera 'io' från socket.io-client-biblioteket
import { io } from 'socket.io-client';

//Skapa en socket-anslutning till servern
const socket = io('http://localhost:3000');

let signupForm = document.querySelector('#signupForm');
let loginForm = document.querySelector('#loginForm');
let sendMessage = document.querySelector('#sendMessage');
let sendBtn = document.querySelector('#sendBtn');
let chatList = document.querySelector('#chatList');
let createRoomBtn = document.querySelector('#createRoomBtn');
let roomNameInput = document.querySelector('#roomName');
let roomList = document.querySelector('#roomList');
let chatSection = document.querySelector('#chatSection');

const startGameBtn = document.querySelector('#startGameBtn');

/* Lägg in funktion till att starta spelet efter 'click', */
startGameBtn.addEventListener('click');



let currentRoom = null; // Variabel för att hålla reda på det aktuella rummet

  createRoomBtn.style.marginTop = '3px';
  createRoomBtn.style.marginBottom = '15px';



// Dölj alla element utom loginForm vid start
signupForm.style.display = 'none';
sendMessage.style.display = 'none';
createRoomBtn.style.display = 'none';
roomNameInput.style.display = 'none';
roomList.style.display = 'none';
chatSection.style.display = 'none';



// ------------------- SIGNUP FORM ----------------------------- //
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
  signupBtn.style.marginTop = '3px';
  signupBtn.style.marginBottom = '15px';

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

// --------------------- LOGIN USER ------------------------- //

function printLoginForm() {

  let inputName = document.createElement('input');
  inputName.placeholder = 'Name';
  let inputPassword = document.createElement('input');
  inputPassword.placeholder = 'Password';
  inputPassword.type = 'password';
  let loginBtn = document.createElement('button');
  loginBtn.innerText = 'Log in';
  loginBtn.style.marginTop = '3px';
  loginBtn.style.marginBottom = '15px';

  loginBtn.addEventListener('click', () => {
    let sendUser = {
      name: inputName.value,
      password: inputPassword.value,
    };
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendUser),
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Login failed');
      }
    })
    .then(data => {
      console.log(data.message);
       // Visa övriga element när användaren är inloggad
      sendMessage.style.display = 'block';
      createRoomBtn.style.display = 'block';
      roomNameInput.style.display = 'block';
      roomList.style.display = 'block';
      chatSection.style.display = 'block';

      socket.emit('login', sendUser.name);
    })
    .catch(error => {
      console.error('Login error:', error);
    })
  })
  loginForm.append(inputName, inputPassword, loginBtn);
}

printLoginForm();
/*
// --------------------------- TILLDELA FÄRG ----------------------------- //

const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];

function assignRandomColorToUser() {
    const randomIndex = Math.floor(Math.random() * 4);

    return colors[randomIndex];
}
const userColor = assignRandomColorToUser();
console.log(userColor); // Skriver ut den tilldelade färgen för användaren

// ------------------------- FORTSÄTTNING ------------------------ //

// Lyssna på händelsen när en ny användare ansluter
socket.on('connect', () => {
  // Tilldela den slumpmässiga färgen till den anslutna användaren
  const userColor = assignRandomColorToUser();

  // Skicka färgen till den anslutna klienten
  socket.emit('assignColor', userColor);
});
socket.on('assignColor', (userColor) => {
  console.log('Received assigned color:', userColor);
});

// ------------------------- FORTSÄTTNING TILLDELNING ------------------------ //

// Lyssna på händelsen när en färg tilldelas till användaren på klienten
socket.on('assignColor', (userColor) => {
  console.log('Received assigned color:', userColor);

  let messageElement = document.createElement('p');
  let userName = document.getElementById('userName').value;
  
  messageElement.textContent = `${inputName.value}, du får `;
  let coloredText = document.createElement('span');
  messageElement.id ="userName";
  coloredText.style.color = userColor;
  coloredText.textContent = 'röd';
  messageElement.appendChild(coloredText);
  messageElement.textContent += ' färg.';
  document.body.appendChild(messageElement);
});

assignRandomColorToUser()

*/










// ------------------------- SKAPA RUM ----------------------------------- //

// Lägg till en händelselyssnare för att skapa ett rum när knappen klickas på
createRoomBtn.addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();
  if (roomName !== '') {
      // Skapa en länk för det nya rummet
      const roomLink = document.createElement('a');
      roomLink.href = '#'; // Länken kommer inte att leda någonstans för nu
      roomLink.innerText = roomName;
      roomLink.addEventListener('click', () => {
          // När länken klickas, sätt det aktuella rummet och visa chatten
          currentRoom = roomName;
          chatSection.style.display = 'block';
          socket.emit('switchRoom', currentRoom);
      });

      // Lägg till länken till rumlistan
      roomList.appendChild(roomLink);

      // Återställ inputfältet
      roomNameInput.value = '';

      // Meddela servern att användaren har skapat ett nytt rum
      socket.emit('createRoom', roomName);
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

socket.on('switchRoom', (newRoom) => {
  socket.leave(currentRoom);
  socket.join(newRoom);
  currentRoom = newRoom;
});

// Funktion för att uppdatera rumlistan på användargränssnittet
function updateRoomList(rooms) {
  roomList.innerHTML = '';
  rooms.forEach((room) => {
    let roomLink = document.createElement('a');
    roomLink.href = '#';
    roomLink.innerText = room;
    roomLink.addEventListener('click', () => {
      currentRoom = room;
      chatSection.style.display = 'block';
      socket.emit('joinRoom', room);
    });
    roomList.appendChild(roomLink);
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

// -------------------------------- RUTNÄT ----------------------------------//

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;
const rows = 15;
const cols = 15;
const cellWidth = width / cols;
const cellHeight = height / rows;
canvas.addEventListener('click', function(event) {
  const clickedRow = Math.floor(event.offsetY / cellHeight);
  const clickedCol = Math.floor(event.offsetX / cellWidth);

  ctx.fillStyle = 'black';
  ctx.fillRect(clickedCol * cellWidth, clickedRow * cellHeight, cellWidth, cellHeight);
});

for (let i = 0; i <= rows; i++) {
  ctx.moveTo(0, i * cellHeight);
  ctx.lineTo(width, i * cellHeight);
}

for (let j = 0; j <= cols; j++) {
  ctx.moveTo(j * cellWidth, 0);
  ctx.lineTo(j * cellWidth, height);
}

ctx.strokeStyle = 'black';
ctx.stroke();

// -------------------------- SLUT RUTNÄT ----------------------------//

