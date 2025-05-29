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

let enigmaAsked = false;
let enigmaSolved = false;
let messageCount = 0;

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  messageCount++;

  let systemPrompt = "";

  if (!enigmaAsked && messageCount === 15) {
    enigmaAsked = true;
    systemPrompt = "Tu es un bouffon cruel. Pose la devinette 'combien font 0+0 ?'.";
  } else if (enigmaAsked && !enigmaSolved) {
    const normalized = message.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (["la tête à toto", "la tete a toto"].includes(normalized)) {
      enigmaSolved = true;
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
