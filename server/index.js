import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import rateLimit from "express-rate-limit";

const PORT = process.env.PORT || 8787;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in server/.env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

// Render sits behind a proxy; this lets the rate limit see the real address
app.set('trust proxy', 1);

// ALLOWED_ORIGINS = your extension IDs, e.g. chrome-extension://abc...,chrome-extension://xyz...
// if it's empty (on your Mac), any Chrome extension may call the server
const allowed = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowed.length > 0 ? allowed : /^chrome-extension:\/\// }));

// at most 30 question requests per hour from one address
app.use(
  '/prep',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'too many requests. try again in a bit' },
  }),
);

// the exact JSON shape Gemini must reply with
const prepSchema = {
  type: Type.OBJECT,
  properties: {
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ["technical", "behavioural", "company"],
          },
          text: { type: Type.STRING },
        },
        required: ["type", "text"],
      },
    },
  },
  required: ["skills", "questions"],
};

function prepPrompt({ title, company, description }) {
  return `You are helping a job seeker prepare for an interview.

From the job posting below:
1. List the 4 to 6 most important skills or tools it asks for. Keep each one to 1-3 words, like "React" or "REST APIs".
2. Write 10 interview questions this employer would likely ask for this role:
   - 5 technical questions about the skills in the posting
   - 3 behavioural questions (past experience, teamwork, problems solved)
   - 2 questions about the company or the role itself
   Each question is one sentence, under 25 words.

Only use facts from the posting. Don't invent details about the company.

Job title: ${title}
Company: ${company || "not given"}
Posting:
"""
${description.slice(0, 12000)}
"""`;
}

app.post("/prep/questions", async (req, res) => {
  const { title, company, description } = req.body ?? {};
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    description.trim().length < 50
  ) {
    return res
      .status(400)
      .json({ error: "needs a job title and a description" });
  }

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prepPrompt({ title, company, description }),
      config: {
        responseMimeType: "application/json",
        responseSchema: prepSchema,
        temperature: 0.7,
      },
    });

    const data = JSON.parse(result.text ?? "{}");
    if (!Array.isArray(data.skills) || !Array.isArray(data.questions)) {
      throw new Error("Gemini replied in the wrong shape");
    }
    res.json({ skills: data.skills, questions: data.questions });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "could not get questions from Gemini" });
  }
});

// quick check that the server is up
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`haku server on http://localhost:${PORT}`));
