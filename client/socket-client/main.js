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

let currentRoom = null; // Variabel för att hålla reda på det aktuella rummet

// ---------------- H3 ELEMENT TILL ROOMS -------------------- //
const createRoomSection = document.getElementById('createRoom');
const existingRoomsSection = document.getElementById('existingRooms');

const createRoomHeading = document.createElement('h3');createRoom
createRoomHeading.textContent = 'Create a room';
createRoomSection.insertBefore(createRoomHeading, createRoomSection.firstChild);
createRoomHeading.style.marginTop = "0";
createRoomHeading.style.display = "none";

const existingRoomsHeading = document.createElement('h3');
existingRoomsHeading.textContent = 'Existing rooms';
existingRoomsSection.insertBefore(existingRoomsHeading, existingRoomsSection.firstChild);
existingRoomsHeading.style.marginTop = "0";
existingRoomsHeading.style.display = "none";



// Dölj alla element utom loginForm vid start
sendMessage.style.display = 'none';
createRoomBtn.style.display = 'none';
roomNameInput.style.display = 'none';
roomList.style.display = 'none';
chatSection.style.display = 'none';
signupForm.style.display = 'none';
//startBtn.style.display = 'none';



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
        alert('User created successfully!');
        signupName.value = '';
        signupPassword.value = '';
        console.log(data);
      });
  });
  signupForm.append(signupName, signupPassword, signupBtn);
}

printSignup();

// ----------------------------- LOGGA IN -------------------------------- //
printLoginForm();

function printLoginForm() {

  let inputName = document.createElement('input');
  inputName.placeholder = 'Name';
  let inputPassword = document.createElement('input');
  inputPassword.placeholder = 'Password';
  inputPassword.type = 'password';
  let loginBtn = document.createElement('button');
  loginBtn.innerText = 'Login';
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
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');

        }
      })
      .then((data) => {
        console.log(inputName.value, "logged in");
        // Visa övriga element när användaren är inloggad
        sendMessage.style.display = 'block';
        createRoomBtn.style.display = 'block';
        roomNameInput.style.display = 'block';
        roomList.style.display = 'block';
        chatSection.style.display = 'none';
        loginForm.style.display = "none";
        signupForm.style.display = 'none';
        printLogoutBtn(inputName.value);
        createRoomHeading.style.display = "block";
        existingRoomsHeading.style.display = "block";

        socket.emit('login', sendUser.name);
      })
      .catch((error) => {
        console.error('Login error:', error);
        alert('Login failed, Try again!');
        inputName.value = '';
        inputPassword.value = '';
      });
  });
  loginForm.append(inputName, inputPassword, loginBtn);
}

// ---------------------------------- LOGGA UT ----------------------------------- //

function printLogoutBtn(userName) {

  let logoutBtn = document.createElement('button');
  logoutBtn.innerText = 'Logout';
  logoutBtn.style.marginTop = '150px';
  logoutBtn.style.marginBottom = '10px';
  logoutBtn.addEventListener('click', () => {
    console.log(userName, "logged out");
    alert("You are logging out.");
    localStorage.removeItem('user');
    location.reload();
  });
   let logoutBtnContainer = document.getElementById('logoutBtn');
   logoutBtnContainer.appendChild(logoutBtn);
}


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

//-------------------











// ------------------------- SKAPA RUM ----------------------------------- //

createRoomBtn.addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();
  if (roomName !== '') {
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


// ---------------------------------------- SEND BUTTON -------------------------------------- //

sendBtn.addEventListener('click', () => {
  if (currentRoom) {
    const message = sendMessage.value.trim();
    if (message !== '') {
      // Skicka chattmeddelandet till servern
      socket.emit('chat', { room: currentRoom, message });
      sendMessage.value = ''; // Återställ inputfältet
    } else {
      // Visa en varning om det är tomt
      alert('Please type something first.');
    }
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

// Create an object to store messages for each room
const roomMessages = {};

// Funktion för att uppdatera chattlistan på användargränssnittet
function updateChat(data) {
  const { room, userId, message, color } = data;

  // Check if the roomMessages object has a property for the current room
  if (!roomMessages[room]) {
    roomMessages[room] = [];
  }

  // Add the message to the room-specific messages array
  roomMessages[room].push({ userId, message, color });

  // Keep only the latest 8 messages for the current room
  if (roomMessages[room].length > 8) {
    roomMessages[room].shift(); // Remove the oldest message
  }

  // Clear the chatList and append messages only for the current room
  chatList.innerHTML = '';
  roomMessages[currentRoom].forEach((msgData) => {
    let li = document.createElement('li');
    if (msgData.message.includes('left the room')) {
      li.innerHTML = `<span style="color: ${msgData.color};">${msgData.userId}</span> - <span style="color: red;">${msgData.message}</span>`;
    } else {
      li.innerHTML = `<span style="color: ${msgData.color};">${msgData.userId}</span> - ${msgData.message}`;
    }
    chatList.appendChild(li);
  });
}

socket.on('switchRoom', (newRoom) => {
  // Leave current room and join new room
  socket.leave(currentRoom);
  socket.join(newRoom);
  currentRoom = newRoom;
});


// -------------------------------- TOMT RUTNÄT - CANVAS ----------------------------------//

const emptyCanvas = document.getElementById('myCanvas');
const emptyCtx = emptyCanvas.getContext('2d');
const cellSize = 20;
const rows = 15;
const cols = 15;

emptyCanvas.width = cols * cellSize;
emptyCanvas.height = rows * cellSize;


for (let i = 0; i <= rows; i++) {
  emptyCtx.moveTo(0, i * cellSize);
  emptyCtx.lineTo(cols * cellSize, i * cellSize);
}

for (let j = 0; j <= cols; j++) {
  emptyCtx.moveTo(j * cellSize, 0);
  emptyCtx.lineTo(j * cellSize, rows * cellSize);
}

emptyCtx.strokeStyle = 'black';
emptyCtx.stroke();

emptyCanvas.addEventListener('click', function(event) {
  const clickedRow = Math.floor(event.offsetY / cellSize);
  const clickedCol = Math.floor(event.offsetX / cellSize);

  emptyCtx.fillStyle = 'black';
  emptyCtx.fillRect(clickedCol * cellSize, clickedRow * cellSize, cellSize, cellSize);
});

  
// --------------------------- RUTNÄT BILDER ---------------------------------//

// Butterfly

const butterflyCanvas = document.getElementById('butterflyCanvas');
const ctx = butterflyCanvas.getContext('2d');
const colors = ['#FFFFFF', '#00FF00', '#0000FF', '#FFFF00'];

const butterflyGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 2, 2, 1, 0, 1, 0, 1, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1, 0, 0],
  [0, 0, 0, 1, 2, 2, 1, 1, 1, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 1, 3, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 3, 3, 3, 1, 3, 3, 3, 1, 0, 0, 0],
  [0, 0, 1, 3, 3, 3, 1, 1, 1, 3, 3, 3, 1, 0, 0],
  [0, 0, 1, 2, 2, 1, 0, 1, 0, 1, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  
];

function drawButterfly() {
  for (let i = 0; i < butterflyGrid.length; i++) {
    for (let j = 0; j < butterflyGrid[i].length; j++) {
      const colorIndex = butterflyGrid[i][j];
      ctx.fillStyle = colors[colorIndex];
      ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }
}
drawButterfly();

// Circle

  const circleCanvas = document.querySelector('#circleCanvas');
  const ctxCircle = circleCanvas.getContext('2d');
  const cellSizeCircle = 20;
  const colorsCircle = ['#FFFFFF', '#A9D3FF', '#1E91D6', '#B388EB'];

const circleGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0],
  [0, 0, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 0, 0],
  [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
  [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function drawCircle() {
  for (let i = 0; i < circleGrid.length; i++) {
    for (let j = 0; j < circleGrid[i].length; j++) {
      const colorIndex = circleGrid[i][j];
      ctxCircle.fillStyle = colorsCircle[colorIndex];
      ctxCircle.fillRect(j * cellSizeCircle, i * cellSizeCircle, cellSizeCircle, cellSizeCircle);
    }
  }
}
drawCircle();

// Heart 

const heartCanvas = document.querySelector('#heartCanvas');
  const ctxHeart = heartCanvas.getContext('2d');
  const cellSizeHeart = 20;
  const colorsHeart = ['#FFFFFF', '#a4133c', '#c9184a', '#ff4d6d'];

const heartGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 1, 0, 0, 0, 1, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 0],
  [0, 0, 1, 2, 3, 3, 2, 1, 2, 3, 3, 2, 1, 0, 0],
  [0, 0, 1, 2, 3, 3, 3, 2, 3, 3, 3, 2, 1, 0, 0],
  [0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 3, 3, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function drawHeart() {
  for (let i = 0; i < heartGrid.length; i++) {
    for (let j = 0; j < heartGrid[i].length; j++) {
      const colorIndex = heartGrid[i][j];
      ctxHeart.fillStyle = colorsHeart[colorIndex];
      ctxHeart.fillRect(j * cellSizeHeart, i * cellSizeHeart, cellSizeHeart, cellSizeHeart);
    }
  }
}
drawHeart();

// Watermelon

const watermelonCanvas = document.querySelector('#watermelonCanvas');
  const ctxWatermelon = watermelonCanvas.getContext('2d');
  const cellSizeWatermelon = 20;
  const colorsWatermelon = ['#FFFFFF', '#2c6e49', '#d90429', '#000000'];

const watermelonGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 2, 2, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 1, 1, 0],
  [0, 0, 0, 0, 0, 2, 2, 2, 3, 2, 2, 2, 1, 1, 0],
  [0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0],
  [0, 0, 0, 2, 2, 2, 3, 2, 2, 2, 2, 1, 1, 1, 0],
  [0, 0, 2, 2, 3, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0],
  [0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function drawWatermelon() {
  for (let i = 0; i < watermelonGrid.length; i++) {
    for (let j = 0; j < watermelonGrid[i].length; j++) {
      const colorIndex = watermelonGrid[i][j];
      ctxWatermelon.fillStyle = colorsWatermelon[colorIndex];
      ctxWatermelon.fillRect(j * cellSizeWatermelon, i * cellSizeWatermelon, cellSizeWatermelon, cellSizeWatermelon);
    }
  }
}
drawWatermelon();

// Pokemonboll

const pokemonCanvas = document.querySelector('#pokemonCanvas');
const ctxPokemon = pokemonCanvas.getContext('2d');
const cellSizePokemon = 20;
const colorsPokemon = ['#FFFFFF', '#d90429', '#000000', '#e5e5e5'];

const pokemonGrid = [
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0],
[0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0],
[0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0],
[0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
[0, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 0],
[0, 2, 1, 1, 1, 1, 2, 3, 3, 2, 1, 1, 1, 2, 0],
[0, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 0],
[0, 2, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 2, 0],
[0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 0],
[0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 2, 0, 0, 0],
[0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function drawPokemon() {
for (let i = 0; i < pokemonGrid.length; i++) {
  for (let j = 0; j < pokemonGrid[i].length; j++) {
    const colorIndex = pokemonGrid[i][j];
    ctxPokemon.fillStyle = colorsPokemon[colorIndex];
    ctxPokemon.fillRect(j * cellSizePokemon, i * cellSizePokemon, cellSizePokemon, cellSizePokemon);
  }
}
}
drawPokemon();


// ----------------------- START BUTTON ----------------------------- //

const startBtn = document.getElementById('startBtn');
startBtn.innerText = 'Start Game';

let userColor = null;

// Skapa en funktion för att generera en slumpmässig färg från butterflyGrid-färger
function getRandomColor() {
  const availableColors = ['#FFFFFF', '#00FF00', '#0000FF', '#FFFF00'];
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
}

startBtn.addEventListener('click', function() {
  socket.on('gameStarted', () => {
    
  // Hämta en slumpmässig färg från butterflyGrid
  userColor = getRandomColor();
  console.log('Användaren fick den slumpmässiga färgen:', userColor);
  socket.emit('startGame');
  alert('The game has started!');
  drawButterfly();
  showButterflyCanvas();
  startBtn.style.display = 'none';

});

// Lyssna på händelsen när användaren klickar på emptyCanvas för att rita
emptyCanvas.addEventListener('click', function(event) {
  const clickedRow = Math.floor(event.offsetY / cellSize);
  const clickedCol = Math.floor(event.offsetX / cellSize);

  // Rita på emptyCanvas med användarens färg
  emptyCtx.fillStyle = userColor;
  emptyCtx.fillRect(clickedCol * cellSize, clickedRow * cellSize, cellSize, cellSize);
});
//alert('The game has started!');
//drawButterfly();
//showButterflyCanvas();
//startBtn.style.display = 'none';
// Eller, aktivera spellogiken eller visa spelinterfacet
});

// Lyssna på händelsen när användaren skickar meddelande
sendBtn.addEventListener('click', () => {
  if (currentRoom) {
    const message = sendMessage.value.trim();
    if (message !== '') {
      // Skicka chattmeddelandet till servern med användarens färg
      socket.emit('chat', { room: currentRoom, message, color: userColor });
      sendMessage.value = ''; // Återställ inputfältet
    }
  }

});


function showButterflyCanvas() {
  document.getElementById('butterflyCanvas').style.display = 'block';

  document.getElementById('myCanvas').style.display = 'none';

  setTimeout(function() {
    document.getElementById('myCanvas').style.display = 'block';
    document.getElementById('butterflyCanvas').style.display = 'none';
  }, 5000);
}



// ----------------------- SAVE / IMPORT - START ----------------------------- //

// Create save button
const saveButton = document.createElement('button');
saveButton.innerText = 'Save Image';
saveButton.style.display = 'none';
saveButton.style.marginTop = '10px';
document.body.appendChild(saveButton);

// Function to save canvas image
saveButton.addEventListener('click', function() {
  const downloadLink = document.createElement('a');
  downloadLink.download = 'canvas_image.png';
  const dataURL = myCanvas.toDataURL('image/png');
  downloadLink.href = dataURL;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
});

// Create import button
const importButton = document.createElement('button');
importButton.innerText = 'Import Image';
importButton.style.display = 'none'; 
importButton.style.marginTop = '10px';
document.body.appendChild(importButton);

// Import file settings
const imageInput = document.createElement('input');
imageInput.type = 'file';
imageInput.accept = 'image/*';
imageInput.style.display = 'none'; 
imageInput.style.marginTop = '10px';
document.body.appendChild(imageInput);
importButton.addEventListener('click', function() {
  imageInput.click();
});

// Function to handle image import
imageInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const image = new Image();
      image.onload = function () {
        const ctx = myCanvas.getContext('2d');
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        ctx.drawImage(image, 0, 0, myCanvas.width, myCanvas.height);
        event.target.value = '';
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// Show import button on click of startBtn
startBtn.addEventListener('click', function() {
  saveButton.style.display = 'block';
  importButton.style.display = 'block';
});

// ----------------------- SAVE / IMPORT - END ----------------------------- //
