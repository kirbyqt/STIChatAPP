const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Listen for room and users update
socket.on('roomusers', ({ room, users }) => {
  if (roomName) outputRoomName(room);
  if (userList) outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down to latest
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// Message submit
if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let msg = e.target.elements.msg.value.trim();
    if (!msg) return;

    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });
}

// ✅ OUTPUT MESSAGE with Reaction Buttons
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');

  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>
    <div class="reactions">
      <button class="reaction-btn" data-reaction="👍">👍</button>
      <button class="reaction-btn" data-reaction="❤️">❤️</button>
      <button class="reaction-btn" data-reaction="😂">😂</button>
      <span class="reaction-counts" data-reactions="{}"></span>
    </div>
  `;

  if (chatMessages) {
    chatMessages.appendChild(div);
  }
}

// ✅ Reaction Button Handler
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('reaction-btn')) {
    const reaction = e.target.dataset.reaction;
    const messageEl = e.target.closest('.message');
    const countsSpan = messageEl.querySelector('.reaction-counts');

    // Get current counts or start fresh
    let counts = {};
    try {
      counts = JSON.parse(countsSpan.dataset.reactions);
    } catch (err) {
      counts = {};
    }

    // Update count
    counts[reaction] = (counts[reaction] || 0) + 1;

    // Save back to span
    countsSpan.dataset.reactions = JSON.stringify(counts);

    // Display reactions
    countsSpan.textContent = Object.entries(counts)
      .map(([emoji, count]) => `${emoji} ${count}`)
      .join('   ');
  }
});

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// Leave room confirmation
const leaveBtn = document.getElementById('leave-btn');
if (leaveBtn) {
  leaveBtn.addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = '../index.html';
    }
  });
}
