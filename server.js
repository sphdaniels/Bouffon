import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

const userStates = {};

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[^a-z ]/g, "") // remove punctuation
    .trim();
}

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  const sessionId = req.body.sessionId;

  if (!userStates[sessionId]) {
    userStates[sessionId] = {
      count: 0,
      enigmaAsked: false,
      enigmaSolved: false,
      lastWrongGuessIndex: null,
    };
  }

  const userState = userStates[sessionId];
  userState.count += 1;

  let systemPrompt = "";

  const msgNorm = normalize(message);

  // S'il a résolu l'énigme
  if (userState.enigmaAsked && !userState.enigmaSolved &&
      (msgNorm.includes("la tete a toto") || msgNorm.includes("la tête à toto"))) {
    userState.enigmaSolved = true;
    systemPrompt = "Tu dis simplement : '5'. Ensuite tu redeviens un bouffon cruel, moqueur, à l’humour noir dérangeant. Tu ne redis plus jamais la devinette.";
  }

  // S’il n’a pas encore répondu juste
  else if (userState.enigmaAsked && !userState.enigmaSolved) {
    if (
      userState.lastWrongGuessIndex === null ||
      userState.count - userState.lastWrongGuessIndex === 2
    ) {
      userState.lastWrongGuessIndex = userState.count;
      systemPrompt = "Tu te moques méchamment de la mauvaise réponse sans dire la solution, puis tu poses exactement la même devinette : 'Combien font 0+0 ?'.";
    } else {
      systemPrompt = "Tu ignores sa tentative ou continues à le ridiculiser, mais tu ne poses pas encore la devinette.";
    }
  }

  // Si on est entre le 15ᵉ et 20ᵉ message et que la devinette n’a jamais été posée
  else if (!userState.enigmaAsked && userState.count === 15) {
    userState.enigmaAsked = true;
    systemPrompt = "Tu poses une devinette avec cruauté. La question est : 'Combien font 0+0 ?'. Ne donne pas la réponse. Attends qu’il dise une variante de 'la tête à Toto'.";
  }

  // Si tout est normal après énigme résolue
  else if (userState.enigmaSolved) {
    systemPrompt = "Tu es un bouffon grotesque, cruel, à l’humour noir. Tu restes dans ce personnage à chaque réponse.";
  }

  // Par défaut
  else {
    systemPrompt = "Tu es un bouffon moqueur, cruel et absurde, avec un humour noir. Tu ignores les règles de bienséance. Tu n’es jamais neutre ni sympathique.";
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
  });

  res.json({ reply: completion.choices[0].message.content });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
  console.log("✅ Serveur lancé sur le port 3000");
});
