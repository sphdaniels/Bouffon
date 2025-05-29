async function sendMessage() {
  const input = document.getElementById("message");
  const message = input.value.trim();
  if (!message) return;
  appendMessage("Vous", message);
  input.value = "";
  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  appendMessage("Bouffon", data.reply);
}
function appendMessage(sender, text) {
  const chat = document.getElementById("chat");
  chat.innerHTML += `\n\n<b>${sender} :</b> ${text}`;
  chat.scrollTop = chat.scrollHeight;
}