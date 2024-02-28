import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

let sendMessage = document.querySelector('#sendMessage');
let sendBtn = document.querySelector('#sendBtn');
let chatList = document.querySelector('#chatList');

function updateChat(chat) {
  let li = document.createElement('li');
  li.innerText = chat;
  chatList.appendChild(li);
}

sendBtn.addEventListener('click', () => {
  console.log('send chat', sendMessage.value);

  socket.emit('chat', sendMessage.value);
})

socket.on('chat', (arg) => {
  console.log('socket', arg);

  updateChat(arg);
})