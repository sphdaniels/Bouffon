let messageCount = 0;
let enigmaSolved = false;

async function sendMessage() {
  const message = document.getElementById("message").value;
  if (!message) return;

  appendMessage("Vous", message);
  document.getElementById("message").value = "";
  messageCount++;

  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message,
      count: messageCount,
      solved: enigmaSolved
    }),
  });

  const data = await response.json();
  appendMessage("Bouffon", data.reply);

  if (data.reply.includes("Voici ce que je suis sensé te délivrer")) {
    enigmaSolved = true;
  }
}

function appendMessage(sender, message) {
  const chat = document.getElementById("chat");
  const messageElement = document.createElement("p");
  messageElement.innerHTML = `<strong>${sender} :</strong><br>${message}`;
  chat.appendChild(messageElement);
  chat.scrollTop = chat.scrollHeight;
}
