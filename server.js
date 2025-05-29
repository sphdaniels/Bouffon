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

const GOOD_ANSWERS = [
  "la tête à toto",
  "la tete à toto",
  "la tête a toto",
  "la tete a toto"
];

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  const messageCount = req.body.count;
  let session = req.body.session || {};
  let systemPrompt = "";

  if (!session.enigmaAsked && messageCount >= 15) {
    session.enigmaAsked = true;
    session.enigmaSolved = false;
    systemPrompt = "Tu es un bouffon cruel. Pose la devinette 'combien font 0+0 ?'.";
  } else if (session.enigmaAsked && !session.enigmaSolved) {
    const userMessage = message.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (GOOD_ANSWERS.includes(userMessage)) {
      session.enigmaSolved = true;
      systemPrompt = "Tu redeviens sarcastique et tu dis : 'Bravo. Voici ce que je suis sensé te délivrer, pour une fois avec sérieux : 5'";
    } else {
      systemPrompt = "Tu es moqueur et cruel. Tu te moques méchamment de la mauvaise réponse et tu redis : 'Combien font 0+0 ?'";
    }
  } else {
    systemPrompt = "Tu es un bouffon sarcastique, avec un humour noir. Réponds aux messages de façon méchante et absurde. Tu ne dois jamais dire que tu es sarcastique ou moqueur. Ne parle plus jamais de la devinette.";
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
  });

  res.json({ reply: completion.choices[0].message.content, session });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => console.log("✅ Serveur lancé sur le port 3000"));
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

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  const count = req.body.count || 0;
  const solved = req.body.solved || false;

  let systemPrompt = "";

  if (count === 15) {
    systemPrompt = "Tu es un bouffon cruel. Pose la devinette 'combien font 0+0 ?'.";
  } else if (count > 15 && !solved) {
    const normalized = message.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (["la tete a toto", "la tête à toto"].includes(normalized)) {
      systemPrompt = "Tu redeviens sarcastique et tu dis : 'Bravo. Voici ce que je suis sensé te délivrer, pour une fois avec sérieux : 5'";
    } else {
      systemPrompt = "Tu es moqueur et cruel. Tu te moques de la mauvaise réponse et tu redis : 'Combien font 0+0 ?'";
    }
  } else {
    systemPrompt = "Tu es un bouffon sarcastique, avec un humour noir. Réponds aux messages de façon méchante et absurde.";
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
  });

  res.json({ reply: completion.choices[0].message.content });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => console.log("✅ Serveur lancé sur le port 3000"));
