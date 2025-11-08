import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleAuth } from "google-auth-library";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
// Accept either GEMINI_API_KEY (server) or REACT_APP_GEMINI_API_KEY (if you placed it there)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI API key is missing. Set GEMINI_API_KEY in your server environment (or REACT_APP_GEMINI_API_KEY for fallback).");
  // Optionally exit in dev to make the problem obvious:
  // process.exit(1);
}

app.post("/api/generate-task", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const useApiKey = process.env.GEMINI_USE_API_KEY === "true";
  let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const headers = { "Content-Type": "application/json" };

  if (useApiKey) {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is required when GEMINI_USE_API_KEY=true." });
    }
    url = `${url}?key=${GEMINI_API_KEY}`;
  } else {
    // Try to obtain OAuth2 access token via ADC / service account
    try {
      const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
      const client = await auth.getClient();
      const accessTokenResp = await client.getAccessToken();
      const accessToken = accessTokenResp?.token || accessTokenResp;
      if (!accessToken) throw new Error("no access token returned");
      headers.Authorization = `Bearer ${accessToken}`;
    } catch (authErr) {
      console.error("Google auth failed:", authErr?.message || authErr);
      // Fallback: if we have an API key, use it instead of failing hard
      if (GEMINI_API_KEY) {
        console.warn("Falling back to API key because OAuth failed. Set GEMINI_USE_API_KEY=true to make this explicit.");
        url = `${url}?key=${GEMINI_API_KEY}`;
      } else {
        return res.status(500).json({
          error: "Failed to obtain Google OAuth token. Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON or set GEMINI_USE_API_KEY=true to use an API key."
        });
      }
    }
  }

  try {
    const modelPrompt = `Create a single task with name, date, time, and description based on this prompt: "${prompt}". Return ONLY valid JSON like {"name":"...","date":"YYYY-MM-DD","time":"HH:MM","desc":"..."}.
    If the user does not provide a date or time, fill in the date as No date and time as No time. If the user writes "today" or "tomorrow", or similar, write that instead of a date in all lowercase.`;
 
    // Correct Gemini API request format
    const requestBody = {
      contents: [{
        parts: [{
          text: modelPrompt
        }]
      }]
    };

    const response = await axios.post(url, requestBody, { headers });
 
    // Extract text from response
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No text generated from API");
    }

    // Try to parse JSON directly, otherwise try to extract first {...} substring
    let parsedTask = null;
    try {
      parsedTask = JSON.parse(generatedText);
    } catch (e) {
      // try to extract JSON object substring
      const match = generatedText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedTask = JSON.parse(match[0]);
        } catch (e2) {
          parsedTask = null;
        }
      }
    }

    // Return both raw text and parsed object (if available)
    return res.json({ text: generatedText, task: parsedTask });
  } catch (err) {
    console.error("Generative API error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "AI task generation failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});