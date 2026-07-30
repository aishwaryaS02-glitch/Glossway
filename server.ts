import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation, Type } from "@google/genai";

dotenv.config();

// Lazy-loaded Gemini API client to prevent crashing if key is missing on startup
let aiClient: GoogleGenAI | null = null;

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const errorMsg = String(err.message || err);
    const isTransient = 
      errorMsg.includes("503") || 
      errorMsg.includes("UNAVAILABLE") || 
      errorMsg.includes("high demand") || 
      errorMsg.includes("temporary") || 
      errorMsg.includes("429") || 
      errorMsg.includes("ResourceExhausted") || 
      errorMsg.includes("rate limit");

    if (retries > 0 && isTransient) {
      console.warn(`Transient Gemini error encountered: "${errorMsg}". Retrying in ${delayMs}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return retryWithBackoff(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    const client = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    // Intercept and wrap generateContent with automatic retry
    const originalGenerateContent = client.models.generateContent.bind(client.models);
    client.models.generateContent = async function(this: any, ...args: any[]) {
      return retryWithBackoff(() => originalGenerateContent(...args));
    } as any;

    // Intercept and wrap generateContentStream with automatic retry
    const originalGenerateContentStream = client.models.generateContentStream.bind(client.models);
    client.models.generateContentStream = async function(this: any, ...args: any[]) {
      return retryWithBackoff(() => originalGenerateContentStream(...args));
    } as any;

    aiClient = client;
  }
  return aiClient;
}

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "");
    cleaned = cleaned.replace(/\n```$/, "");
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Tutor Chat proxy with server-side Gemini SDK
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, modelType, language, levelName, goal, weakAreas, isFlashcardGenerator } = req.body;
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ text: "Hello! Please add your Gemini API key in the settings to chat with me." });
      }

      const client = getGeminiClient();
      const currentLanguage = language || "their chosen language";
      const nativeLanguage = "English";
      const cefrLevel = levelName || "A2 (Beginner)";
      const learningGoal = goal || "Conversational fluency, accent training, and everyday confidence";
      const weakAreasText = weakAreas || "Sentence framing speed, verb conjugation, and idiomatic expressions";
      const todayFocus = "Interactive practice, error correction, and vocabulary reuse in realistic context";

      const getSystemPrompt = (tutorName: string, extraDirectives: string) => `
# 1. Role & Identity

You are ${tutorName}, a friendly, patient language tutor helping the user learn ${currentLanguage}.

# 2. Learner Profile (personalization variables)

Learner profile:
- Native/fluent language: ${nativeLanguage}
- Target language: ${currentLanguage}
- Proficiency level: ${cefrLevel}
- Learning goal: ${learningGoal}
- Known weak areas: ${weakAreasText}
- Session focus: ${todayFocus}

Everything you do (vocabulary choice, correction depth, pacing) must reference these variables.

# 3. Transliteration & Romanization (CRITICAL MANDATE)
- Whenever you write words, phrases, or sentences in a language with a non-Latin script (such as Kannada, Hindi, Japanese, Mandarin, Russian, Arabic), you MUST ALWAYS append its English transliteration (romanized pronunciation guide) in parentheses immediately after the native script.
  - Example: "Namaskara (ನಮಸ್ಕಾರ)!" or "Oota aaytha (ಊಟ ಆಯ್ತಾ)?"
  - This is a strict requirement to allow the learner to read and practice pronunciation.

# 4. Language-Use Rules
- Calibrate your language balance based on the learner's level:
  - For A1/A2 (Beginners): Speak in a mix of ${currentLanguage} and ${nativeLanguage}. Give explanations, instructions, and friendly context in ${nativeLanguage} (English) so the user doesn't feel lost, but introduce and prompt with ${currentLanguage} words and phrases.
  - For B1/B2 (Intermediate): Speak primarily in ${currentLanguage}. Explain grammar and word nuances in ${currentLanguage} first, falling back to English only if requested.
  - For C1/C2 (Advanced): Speak and explain 100% in ${currentLanguage}.
- If the user asks a question in ${nativeLanguage} (English), reply helpfully and clearly in English while providing the corresponding ${currentLanguage} phrases and grammar.

# 5. Correction Strategy
- Never let an error pass silently, but never let correction interrupt the flow of conversation either.
- Default correction style: "recast" — repeat the user's sentence back correctly, folded naturally into your reply, without explicitly flagging it as wrong, UNLESS the user has asked for explicit corrections or the error is a repeated pattern.
- Track recurring errors across the conversation. If the same mistake appears 2-3 times, pause the conversation briefly to explain the rule, give one example, then continue.
- Never correct more than 1-2 things per message — pick the most important error (comprehension-blocking > minor grammar > style).
- Praise specifically ("Good use of the vocabulary there") rather than generically ("Great job!") so the learner knows what they did right.

# 6. Conversation Flow & Adaptivity
- Keep responses short (2-4 sentences) to maximize the user's speaking/writing turns — you are a conversation partner, not a lecturer.
- Ask a follow-up question at the end of most turns to keep the dialogue going.
- If the user seems confused or frustrated, slow down, simplify, and offer encouragement before continuing.
- If the user is breezing through easily, increase complexity: longer sentences, idiomatic expressions, faster topic shifts.
- Vary interaction modes across a session where possible: free conversation, roleplay scenarios, quick drills, translation challenges.

# 7. Content & Scenario Guidance
- Prioritize vocabulary and grammar structures relevant to the learner's stated goal (${learningGoal}).
- Use realistic, everyday scenarios (ordering food, asking directions, a job interview) rather than abstract or textbook-stilted examples.
- Introduce new vocabulary in context, then reuse it later in the same session to reinforce it.

# 8. Output Format Rules
- When giving a corrected sentence, format it clearly, e.g.:
  You said: "..."
  Better: "..."
- When explaining grammar, use a short rule + one example, not a full grammar-textbook entry, unless asked for depth.
- Avoid dense walls of text. Use line breaks between the conversational reply and any correction/explanation.

# 9. Boundaries & Safety
- Stay on the topic of language learning and closely related cultural context. Politely redirect off-topic requests back to the lesson.
- Do not fabricate grammar rules or etymology you're unsure of — say so and give your best general guidance instead.

# 10. Engine-Specific Instructions
${extraDirectives}
`;

      let systemInstruction = "";
      const isGemini = modelType === "gemini" || !modelType;

      if (isFlashcardGenerator) {
        systemInstruction = `You are a precise multilingual linguistic database generator. Generate the requested example sentence, translation, and pronunciation guide exactly in the requested raw JSON format. Return ONLY the raw JSON object, without markdown blocks, without backticks, and without any conversational filler. Keep translations accurate and clear. Example structure:
{
  "sentence": "ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಾ?",
  "translation": "Hello, how are you?",
  "pronunciation": "Namaskara, hegiddeera?"
}`;
      } else if (modelType === "chatgpt") {
        systemInstruction = getSystemPrompt(
          "Léo (ChatGPT Pro Linguistic Tutor)",
          `

Ensure you:
1. Provide extremely concise, structured bullet points, and clean syntax/conjugation tables.
2. Frame multiple sentence examples (including up to 100 variations if the user asks for high counts) to clarify syntax.
3. Be highly pedagogical: ask direct continuation questions and challenge the user to practice.
4. Keep answers clean, straightforward, and direct. Format output elegantly using rich markdown styling (bolding, lists, tables).`
        );
      } else if (modelType === "claude") {
        systemInstruction = getSystemPrompt(
          "Aria (Claude Intellectual Scholar)",
          `

Ensure you:
1. Explain the historical context, cultural syntax, and micro-nuances of each word, phrase, and sentence.
2. Provide high-quality structural breakdowns of vocabulary words and particle relationships.
3. Offer detailed sentence framing exercises with multiple varied examples.
4. Prompt the user with open-ended, analytical language questions. Format output elegantly using rich markdown formatting.`
        );
      } else {
        // Gemini - search grounded
        systemInstruction = getSystemPrompt(
          "Glossway Tutor (Gemini Grounded Search Guru)",
          `

Ensure you:
1. Pull live information, cultural trends, and real-world usages across websites to enrich your language teaching.
2. Highlight cultural facts, modern slang, and cite reliable web sources when appropriate.
3. Offer clear pronunciation guidelines, grammar explanations, and example sentences.
4. Format output elegantly using rich markdown formatting.`
        );
      }

      // Format history into structure expected by generateContent
      const contents: any[] = [];
      
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          if (msg && typeof msg.text === "string" && msg.text.trim()) {
            contents.push({
              role: msg.sender === "user" ? "user" : "model",
              parts: [{ text: msg.text.trim() }],
            });
          }
        });
      }

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Strict role alternating filter for Gemini API compatibility
      const cleanedContents: any[] = [];
      contents.forEach((item) => {
        if (cleanedContents.length === 0) {
          cleanedContents.push(item);
        } else {
          const lastItem = cleanedContents[cleanedContents.length - 1];
          if (lastItem.role === item.role) {
            // Merge consecutive messages with the same role
            lastItem.parts[0].text += "\n\n" + item.parts[0].text;
          } else {
            cleanedContents.push(item);
          }
        }
      });

      const config: any = {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      };

      // Apply Google Search Grounding for Gemini unless it is generating flashcards
      if (isGemini && !isFlashcardGenerator) {
        config.tools = [{ googleSearch: {} }];
      }

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: cleanedContents,
          config: config,
        });
      } catch (firstError: any) {
        const errorMsg = firstError.message || "";
        const isTransientError = errorMsg.includes("429") || 
                                 errorMsg.includes("503") ||
                                 errorMsg.includes("quota") || 
                                 errorMsg.includes("RESOURCE_EXHAUSTED") || 
                                 errorMsg.includes("limit") ||
                                 errorMsg.includes("UNAVAILABLE") ||
                                 errorMsg.includes("demand") ||
                                 errorMsg.includes("overload") ||
                                 errorMsg.includes("temporary");
        
        if (isTransientError) {
          console.warn("Primary gemini-3.6-flash model rate limited or overloaded. Attempting automatic fallback to gemini-3.6-flash...");
          try {
            // Strip search grounding for fallback to maximize compatibility/quota limits
            const fallbackConfig = { ...config };
            if (fallbackConfig.tools) {
              delete fallbackConfig.tools;
            }
            response = await client.models.generateContent({
              model: "gemini-3.6-flash",
              contents: cleanedContents,
              config: fallbackConfig,
            });
          } catch (secondError: any) {
            console.error("Fallback to gemini-3.6-flash also failed:", secondError);
            throw secondError;
          }
        } else {
          throw firstError;
        }
      }

      // Extract search grounding metadata if any
      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const groundingSources = searchChunks ? searchChunks.map((chunk: any) => ({
        title: chunk.web?.title || "Search Source",
        uri: chunk.web?.uri || ""
      })).filter((s: any) => s.uri) : null;

      res.json({ 
        text: response.text,
        groundingSources: groundingSources
      });
    } catch (error: any) {
      console.error("Gemini API Error details:", error);
      const errorMsg = error.message || "";
      const isQuotaError = errorMsg.includes("429") || 
                           errorMsg.includes("quota") || 
                           errorMsg.includes("RESOURCE_EXHAUSTED") || 
                           errorMsg.includes("limit");
      const isDemandError = errorMsg.includes("503") ||
                            errorMsg.includes("UNAVAILABLE") ||
                            errorMsg.includes("demand") ||
                            errorMsg.includes("overload") ||
                            errorMsg.includes("temporary");

      if (isQuotaError) {
        res.status(429).json({
          error: "Gemini API Quota Limit Exceeded. To keep learning without interruptions, please configure your own Gemini API Key in the 'Settings > Secrets' menu of AI Studio, or try again in a few moments.",
          isQuotaExceeded: true
        });
      } else if (isDemandError) {
        res.status(503).json({
          error: "The tutor engine is currently experiencing exceptionally high demand (503 Service Unavailable). Spikes in demand are temporary. Cool-down mode has been activated to safeguard service availability.",
          isQuotaExceeded: true
        });
      } else {
        res.status(500).json({
          error: error.message || "An error occurred while contacting the AI tutor",
        });
      }
    }
  });

  // API Route: Generate study beats/ambient focus tracks using Lyria
  app.post("/api/generate-music", async (req, res) => {
    try {
      const { prompt, model = "lyria-3-clip-preview" } = req.body;
      const client = getGeminiClient();
      const responseStream = await client.models.generateContentStream({
        model: model,
        contents: prompt || "Lofi study beats for language learning focus, soothing, beautiful ambient style",
        config: {
          responseModalities: ["AUDIO"]
        }
      });

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      res.json({ audio: audioBase64, lyrics, mimeType });
    } catch (error: any) {
      console.error("Music generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate music" });
    }
  });

  // API Route: Generate high-quality visual study flashcard illustrations
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1", imageSize = "1K", quality = "standard" } = req.body;
      const client = getGeminiClient();
      const model = quality === "high" ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";

      let response;
      try {
        response = await client.models.generateContent({
          model: model,
          contents: {
            parts: [{ text: prompt || "A beautiful watercolor painting of Tokyo street in spring, cinematic lighting" }]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: imageSize
            }
          }
        });
      } catch (firstError: any) {
        console.warn(`Primary image generation model ${model} failed. Attempting fallback to gemini-3.6-flash-image...`);
        response = await client.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: prompt || "A beautiful watercolor painting of Tokyo street in spring, cinematic lighting" }]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }
        });
      }

      let base64Image = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Image) {
        throw new Error("No image data returned from Gemini API");
      }

      res.json({ image: base64Image });
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // API Route: Analyze uploaded photos/images with Gemini Pro Vision
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt } = req.body;
      if (!imageBase64 || !mimeType) {
        res.status(400).json({ error: "imageBase64 and mimeType are required" });
        return;
      }

      const client = getGeminiClient();
      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: {
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: mimeType
                }
              },
              {
                text: prompt || "Analyze this image and explain any written words, objects, and cultural context that can help me learn vocabulary in this language."
              }
            ]
          }
        });
      } catch (firstError: any) {
        console.warn("Primary gemini-2.5-pro for analyze-image failed. Attempting fallback to gemini-3.6-flash...");
        try {
          response = await client.models.generateContent({
            model: "gemini-3.6-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                  }
                },
                {
                  text: prompt || "Analyze this image and explain any written words, objects, and cultural context that can help me learn vocabulary in this language."
                }
              ]
            }
          });
        } catch (secondError: any) {
          console.warn("Secondary gemini-3.6-flash for analyze-image failed. Attempting final fallback to gemini-3.6-flash...");
          response = await client.models.generateContent({
            model: "gemini-3.6-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                  }
                },
                {
                  text: prompt || "Analyze this image and explain any written words, objects, and cultural context that can help me learn vocabulary in this language."
                }
              ]
            }
          });
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Image analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  // API Route: Start Veo video generation for travel & cultural study clips
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt, aspectRatio = "16:9", imageBytes, mimeType } = req.body;
      const client = getGeminiClient();

      const config: any = {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: aspectRatio
      };

      let payload: any = {
        model: "veo-2.0-generate",
        prompt: prompt || "A beautiful temple garden in Kyoto with cherry blossoms gently falling, slow motion, cinematic 4k",
        config: config
      };

      if (imageBytes && mimeType) {
        payload.image = {
          imageBytes: imageBytes,
          mimeType: mimeType
        };
      }

      const operation = await client.models.generateVideos(payload);
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Video generation start error:", error);
      res.status(500).json({ error: error.message || "Failed to start video generation" });
    }
  });

  // API Route: Poll Veo video status
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: "operationName is required" });
        return;
      }

      const client = getGeminiClient();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await client.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done });
    } catch (error: any) {
      console.error("Video status error:", error);
      res.status(500).json({ error: error.message || "Failed to check video status" });
    }
  });

  // API Route: Stream finished Veo video download
  app.post("/api/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: "operationName is required" });
        return;
      }

      const client = getGeminiClient();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await client.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        res.status(400).json({ error: "Video is not completed or has no download URI" });
        return;
      }

      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY || "" },
      });

      res.setHeader("Content-Type", "video/mp4");
      videoRes.body!.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } catch (error: any) {
      console.error("Video download error:", error);
      res.status(500).json({ error: error.message || "Failed to download video" });
    }
  });

  // API Route: Transcribe and analyze microphone recordings for pronunciation coaching
  app.post("/api/transcribe-audio", async (req, res) => {
    try {
      const { audioBase64, mimeType = "audio/webm" } = req.body;
      if (!audioBase64) {
        res.status(400).json({ error: "audioBase64 is required" });
        return;
      }

      const client = getGeminiClient();
      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  data: audioBase64,
                  mimeType: mimeType
                }
              },
              {
                text: req.body.promptContext || "Listen to this pronunciation audio clip. Transcribe what was said exactly. Then, provide highly helpful, friendly language learning feedback. Tell me whether the pronunciation sounds natural, accurate, or if there is room for accent improvement."
              }
            ]
          }
        });
      } catch (firstError: any) {
        console.warn("Primary gemini-3.6-flash for transcribe-audio failed. Attempting fallback to gemini-3.6-flash...");
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  data: audioBase64,
                  mimeType: mimeType
                }
              },
              {
                text: req.body.promptContext || "Listen to this pronunciation audio clip. Transcribe what was said exactly. Then, provide highly helpful, friendly language learning feedback. Tell me whether the pronunciation sounds natural, accurate, or if there is room for accent improvement."
              }
            ]
          }
        });
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Audio transcription error:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  });

  // API Route: Deep reasoning, highly conceptual, high-thinking mode language tutor chat
  app.post("/api/high-thinking-chat", async (req, res) => {
    try {
      const { prompt, history, language } = req.body;
      const client = getGeminiClient();

      const cleanedContents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          cleanedContents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        });
      }

      cleanedContents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: cleanedContents,
          config: {
            systemInstruction: `You are a high-reasoning linguistic scholar in the Glossway application. You possess infinite analytical capabilities and deep historical and syntax knowledge for ${language || "the language being practiced"}. You will help the user with their most complex language queries, grammar puzzles, translation questions, and etymological research using your high-reasoning capabilities.`,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH
            }
          }
        });
      } catch (firstError: any) {
        console.warn("Primary gemini-2.5-pro for high-thinking-chat failed. Attempting fallback to gemini-3.6-flash...");
        try {
          response = await client.models.generateContent({
            model: "gemini-3.6-flash",
            contents: cleanedContents,
            config: {
              systemInstruction: `You are a high-reasoning linguistic scholar in the Glossway application. You possess infinite analytical capabilities and deep historical and syntax knowledge for ${language || "the language being practiced"}. You will help the user with their most complex language queries, grammar puzzles, translation questions, and etymological research using your high-reasoning capabilities.`
            }
          });
        } catch (secondError: any) {
          console.warn("Secondary gemini-3.6-flash for high-thinking-chat failed. Attempting final fallback to gemini-3.6-flash...");
          response = await client.models.generateContent({
            model: "gemini-3.6-flash",
            contents: cleanedContents,
            config: {
              systemInstruction: `You are a high-reasoning linguistic scholar in the Glossway application. You possess infinite analytical capabilities and deep historical and syntax knowledge for ${language || "the language being practiced"}. You will help the user with their most complex language queries, grammar puzzles, translation questions, and etymological research using your high-reasoning capabilities.`
            }
          });
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("High thinking chat error:", error);
      res.status(500).json({ error: error.message || "Failed in reasoning chat" });
    }
  });

  // API Route: High-fidelity Text-To-Speech with authentic native accents
  app.post("/api/speak", async (req, res) => {
    try {
      const { text, language } = req.body;
      if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
      }

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Pronounce the following word or sentence clearly in a perfect, fluent ${language || "target language"} voice with exact correct local accent, local syllable stress, and fluent speech pacing. Speak ONLY the exact text and absolutely nothing else. Do not say translations or introductions.
Text: "${text}"` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore"
              }
            }
          }
        }
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (!audioBase64) {
        throw new Error("No voice audio was returned from the generative voice engine.");
      }

      res.json({ audio: audioBase64, mimeType });
    } catch (error: any) {
      console.error("Text to speech synthesis error:", error);
      res.status(500).json({ error: error.message || "Failed to synthesize voice" });
    }
  });

  // API Route: Expand language vocabulary infinitely by level
  app.post("/api/expand-words", async (req, res) => {
    try {
      const { languageId, languageName, levelName } = req.body;
      if (!languageId || !languageName || !levelName) {
        res.status(400).json({ error: "languageId, languageName, and levelName are required" });
        return;
      }

      const client = getGeminiClient();

      let prompt = "";
      if (levelName === "beginner") {
        prompt = `Generate exactly 15 fresh, high-quality, practical, and highly relevant beginner vocabulary words for learning ${languageName}.
Ensure they are different from standard basic words (don't repeat very obvious words like hello, book, house unless you provide interesting context).
Return a raw JSON array of objects, where each object has this EXACT structure:
[
  {
    "word": "native word script (e.g. ನಮಸ್ಕಾರ or school)",
    "pronunciation": "english-phonetic-sounding-guide (e.g. Nah-mah-skah-rah)",
    "translation": "english meaning (e.g. Hello)",
    "partOfSpeech": "Noun or Verb or Adjective etc."
  }
]
IMPORTANT: Return ONLY raw JSON. No markdown ticks, no conversational text.`;
      } else if (levelName === "middleware") {
        prompt = `Generate exactly 15 fresh, practical, and highly relevant intermediate (middleware) conversational expressions and phrases for learning ${languageName}.
Return a raw JSON array of objects, where each object has this EXACT structure:
[
  {
    "phrase": "native phrase script (e.g. ಊಟ ಆಯ್ತಾ?)",
    "pronunciation": "english-phonetic-pronunciation (e.g. Oo-tah eye-thah)",
    "translation": "english equivalent meaning (e.g. Have you eaten?)",
    "context": "short explanation of when to use it (e.g. Very common friendly greeting)"
  }
]
IMPORTANT: Return ONLY raw JSON. No markdown ticks, no conversational text.`;
      } else {
        // levelName === "pro"
        prompt = `Generate exactly 5 detailed, advanced grammatical rules, sentence structure patterns, or professional idioms for learning ${languageName}.
Return a raw JSON array of objects, where each object has this EXACT structure:
[
  {
    "ruleName": "Short descriptive name of grammatical rule or pattern",
    "explanation": "Clear explanation of how the pattern works in the language",
    "structure": "The grammatical formula or template",
    "examples": [
      {
        "native": "Example sentence in native script",
        "pronunciation": "English phonetic guide for example",
        "translation": "English translation"
      },
      {
        "native": "Second example sentence in native script",
        "pronunciation": "English phonetic guide for second example",
        "translation": "English translation"
      }
    ]
  }
]
IMPORTANT: Return ONLY raw JSON. No markdown ticks, no conversational text.`;
      }

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      } catch (firstError: any) {
        console.warn("Primary gemini-3.6-flash for expand-words failed. Attempting fallback to gemini-3.6-flash...");
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      }

      if (!response.text) {
        throw new Error("No data returned from vocabulary compiler.");
      }

      const words = cleanAndParseJSON(response.text);
      res.json({ success: true, data: words });
    } catch (error: any) {
      console.error("Vocabulary expansion error:", error);
      res.status(500).json({ error: error.message || "Failed to expand vocabulary" });
    }
  });

  // API Route: AI Mentor Suggestions (Quick Context Mode)
  app.post("/api/mentor-suggestions", async (req, res) => {
    try {
      const { recentSearches, streak, wordsLearned, studyTimeToday, activeLanguages } = req.body;
      const client = getGeminiClient();

      const prompt = `You are an expert AI Language Mentor in the Glossway application .
Your task is to analyze the learner's current progress and recent dictionary searches to provide highly tailored, actionable study advice, vocabulary integration tips, and personalized practice recommendations.

LEARNER PROFILE CONTEXT:
- Recent Dictionary Searches: ${JSON.stringify(recentSearches || [])}
- Active Study Languages: ${JSON.stringify(activeLanguages || {})}
- Current Streak: ${streak || 0} days
- Words Learned: ${wordsLearned || 0}
- Study Time Today: ${studyTimeToday || 0} minutes

Please generate a highly professional, beautifully formatted markdown response containing:
1. 🎯 **Personalized Daily Focus**: A motivating, tailored summary of what they should focus on today based on their recent search list and active languages.
2. 💡 **Vocabulary Integration Drill**: Take 1-2 of their recently searched words (or provide 2 relevant vocabulary words for their active languages if recentSearches is empty) and create:
   - A short, realistic reading passage (2-3 sentences) integrating these words.
   - For any non-Latin scripts, make sure to include English transliterations in parentheses!
   - A breakdown of how the words function in context.
3. 🛠️ **Grammar & Syntax recommendation**: Suggest 1-2 grammatical concepts to practice today that align with their level in the active languages and are relevant to their lookups.
4. 🏃 **Actionable Next Step**: Give them 2 precise study challenges they can do right now (e.g. "Start a chat lesson with the Glossway Tutor focusing on the past tense of [word]"). 

Keep the tone editorial, encouraging, scholarly, and deeply personalized. Format using rich markdown headings, bold accents, and clean lists. No filler introductory text, start directly with the markdown content.`;

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
          }
        });
      } catch (firstError: any) {
        console.warn("Primary gemini-3.6-flash for mentor-suggestions failed. Attempting fallback to gemini-3.6-flash...");
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
          }
        });
      }

      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Mentor suggestions error:", error);
      res.status(500).json({ error: error.message || "Failed to generate mentor suggestions" });
    }
  });

  // API Route: AI Dictionary Lookup
  app.post("/api/dictionary", async (req, res) => {
    try {
      const { word, targetLanguage } = req.body;
      if (!word || !targetLanguage) {
        res.status(400).json({ error: "word and targetLanguage are required" });
        return;
      }

      const client = getGeminiClient();
      const prompt = `You are a high-fidelity dictionary translator and analyzer. Analyze the word or expression "${word}" for a student learning ${targetLanguage}.
Provide accurate transliteration, english meaning, level classification (beginner, middleware, or pro), cultural etymology, and a helpful example sentence with translation.
Return a raw JSON object with this EXACT structure (values must be filled out beautifully):
{
  "word": "The word/phrase in native script of ${targetLanguage}",
  "pronunciation": "English phonetic spelling sounding guide",
  "translation": "Direct English translation",
  "partOfSpeech": "Noun, Verb, Adjective, or Phrase",
  "level": "beginner",
  "culturalContext": "A short, highly fascinating 1-2 sentence cultural context or etymology",
  "exampleSentence": "A simple helpful example sentence using this word in native script",
  "exampleTranslation": "English translation of the example sentence"
}
IMPORTANT: Note that "level" must be one of "beginner", "middleware", or "pro". Return ONLY raw JSON. No markdown ticks, no conversational text.`;

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      } catch (firstError: any) {
        console.warn("Primary gemini-3.6-flash for dictionary lookup failed. Attempting fallback to gemini-3.6-flash...");
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      }

      if (!response.text) {
        throw new Error("No data returned from dictionary lookup.");
      }

      const data = cleanAndParseJSON(response.text);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Dictionary lookup error:", error);
      res.status(500).json({ error: error.message || "Failed to search word" });
    }
  });

  // API Route: Quick Add Parse lists of words/phrases with Gemini
  app.post("/api/quick-add-parse", async (req, res) => {
    try {
      const { textList, targetLanguage } = req.body;
      if (!textList || !targetLanguage) {
        res.status(400).json({ error: "textList and targetLanguage are required" });
        return;
      }

      const client = getGeminiClient();
      const prompt = `You are an expert computational linguist. Analyze the following pasted list of vocabulary words, conversational phrases, or grammatical concepts that a user wishes to study in the language: "${targetLanguage}".
Text to parse:
"""
${textList}
"""

Instructions:
1. Parse every distinct item (each line, or word, or comma-separated item, or paragraph concept) into a structured card.
2. Translate English items into "${targetLanguage}", or parse "${targetLanguage}" items into correct translations, depending on what the user pasted.
3. Automatically categorize each parsed item into one of three dynamic learning levels:
   - "beginner": suitable for single vocabulary words, basic parts of speech, simple nouns, adjectives, or short verbs.
   - "middleware": suitable for complete conversational phrases, idioms, common expressions, questions, or greetings.
   - "pro": suitable for complex syntax patterns, grammatical rules, or detailed sentence structures.
4. For each item:
   - Provide "word" (the word or phrase in native script of ${targetLanguage}).
   - Provide "pronunciation" (English phonetic sounding guide, extremely important for learning pronunciation).
   - Provide "translation" (direct, clear English translation).
   - Provide "partOfSpeech" (Noun, Verb, Adjective, Particle, Expression, Phrase, or Grammar Pattern).
   - For "middleware" items, optionally provide a "context" string explaining when or why the phrase is commonly used.
   - For "pro" items, provide an "explanation" string explaining the grammatical concept, and a "structure" string outlining the sentence pattern formulas.
   - Provide an "examples" array containing exactly 1 realistic example sentence utilizing the word/phrase/pattern. The example object must contain:
     * "native": the sentence in native ${targetLanguage} script.
     * "pronunciation": English phonetic pronunciation guide for the sentence.
     * "translation": English translation of the sentence.

Return a raw JSON array of objects with this EXACT structure (return ONLY the array, no extra comments, no markdown tick wrappers):
[
  {
    "category": "beginner" | "middleware" | "pro",
    "word": "The word or phrase in native script of ${targetLanguage}",
    "pronunciation": "English spelling phonetic sounding guide",
    "translation": "Direct English translation",
    "partOfSpeech": "Noun, Verb, Adjective, Phrase, Idiom, or Grammar Pattern",
    "context": "Short contextual explanation (optional, recommended for middleware)",
    "explanation": "Clear explanation of grammar/rules (optional, recommended for pro)",
    "structure": "The grammatical formula/pattern template (optional, recommended for pro)",
    "examples": [
      {
        "native": "Example sentence in native script using the word/phrase",
        "pronunciation": "Phonetic guide for example sentence",
        "translation": "English translation of the example sentence"
      }
    ]
  }
]
IMPORTANT: Return ONLY raw JSON. No markdown ticks, no conversational text.`;

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      } catch (firstError: any) {
        console.warn("Primary gemini-3.6-flash for quick-add-parse failed. Attempting fallback to gemini-3.6-flash...");
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      }

      if (!response.text) {
        throw new Error("No data returned from Gemini parser.");
      }

      const parsedData = cleanAndParseJSON(response.text);
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Quick add parse error:", error);
      res.status(500).json({ error: error.message || "Failed to parse vocabulary list" });
    }
  });


  // API Route: AI Chat Agent
  app.post("/api/chat-agent", async (req, res) => {
    try {
      const { messages, targetLanguage, level, recentMistakes } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required" });
        return;
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ success: true, text: "Hello! Please add your Gemini API key in the settings to chat with me." });
      }
      
      const client = getGeminiClient();
      
      const systemInstruction = `You are the Glossway language tutor — a calm, encouraging AI conversation partner.

CORE PHILOSOPHY:
- Non-punitive. Mistakes are part of learning, never flagged as "wrong" or "incorrect."
- Never use red, X marks, or harsh language in your tone.
- Celebrate attempts before offering corrections.

BEHAVIOR:
1. Respond primarily in the user's target language, at their current level.
2. If they make a grammar or vocab mistake, do NOT interrupt the flow. Reply naturally,
   and gently model the correct form in your own response (recasting), e.g.:
   User: "I go to store yesterday"
   You: "Oh nice, you went to the store yesterday? What did you buy?"
3. Only give an explicit correction if the user asks for one, or if the mistake would
   cause real confusion.
4. Keep responses short (2-4 sentences) — this is a conversation, not a lecture.
5. Match the user's proficiency level: ${level || 'beginner'} (e.g. beginner, intermediate, advanced).
6. Occasionally introduce one new relevant word or phrase, explained simply, then move on.
7. If the user switches to English out of frustration, respond warmly in English first,
   then gently invite them back into the target language.

CONTEXT PROVIDED EACH TURN:
- Target language: ${targetLanguage || 'the language they are learning'}
- User's level: ${level || 'beginner'}
- Recent mistakes/patterns to reinforce gently: ${recentMistakes || 'none provided'}

Never mention that you are an AI model, never break character, and never use
punitive/scorekeeping language ("wrong", "fail", "incorrect").`;

      let formattedMessages = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      
      // Gemini API requires the first message in history to be from the user.
      while (formattedMessages.length > 0 && formattedMessages[0].role === "model") {
        formattedMessages.shift();
      }

      // Add system prompt as the first message from the user
      // Or use systemInstruction if the model supports it. 
      // The easiest way for generic flash models in @google/genai is config.systemInstruction
      
      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: formattedMessages,
          config: {
            systemInstruction: systemInstruction,
          }
        });
      } catch (firstError) {
        console.warn("Primary gemini-3.6-flash for chat failed. Attempting fallback to gemini-3.6-flash...");
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: formattedMessages,
          config: {
            systemInstruction: systemInstruction,
          }
        });
      }
      
      if (!response.text) {
        throw new Error("No data returned from Gemini for chat.");
      }
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Chat agent error:", error);
      const errMsg = error.message || "";
      if (errMsg.includes("429") || errMsg.includes("exceeded your current quota")) {
        return res.json({ success: true, text: "I'm sorry, you have exceeded your Gemini API quota. Please check your billing details or wait a moment before trying again." });
      } else if (errMsg.includes("503") || errMsg.includes("high demand")) {
        return res.json({ success: true, text: "The AI service is currently experiencing high demand. Please try again in a few moments." });
      }
      res.status(500).json({ error: error.message || "Failed to communicate with AI agent." });
    }
  });

  // API Route: AI Composition Critique
  app.post("/api/composition-critique", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text || !targetLanguage) {
        res.status(400).json({ error: "Composition text and targetLanguage are required" });
        return;
      }

      const client = getGeminiClient();
      const prompt = `You are an elite multilingual language tutor and literary editor. Provide a detailed, constructive, and highly elegant critique of the following short paragraph written by a student in the language: "${targetLanguage}".

Student's Paragraph:
"""
${text}
"""

Instructions:
1. Thoroughly critique the composition on three key pillars: Grammar, Vocabulary, and Flow.
2. Provide an overall score out of 100 representing linguistic competence appropriate to their efforts.
3. Suggest an estimated CEFR language level (A1, A2, B1, B2, C1, C2) for the writing.
4. Identify specific errors, providing the original segment, the corrected version, and a clear explanation.
5. Suggest dynamic vocabulary improvements where they can swap simple words with more natural, expressive, or precise terms.
6. Provide a beautifully polished, natural, and natural-sounding rewritten version of their paragraph, followed by its English translation.

Return a raw JSON object with this EXACT structure (return ONLY the raw JSON, no markdown blocks, no leading/trailing conversational text):
{
  "score": 82,
  "cefrLevel": "B1",
  "critique": {
    "grammar": "Critique of the grammatical rules applied, tense consistency, and conjugations.",
    "vocabulary": "Critique of the word choices, stating whether they are natural, repetitive, or simple.",
    "flow": "Critique of the coherence, transition markers, and stylistic rhythm of the paragraph."
  },
  "errors": [
    {
      "original": "the exact faulty phrase or word from the user text",
      "correction": "the corrected equivalent",
      "explanation": "Why this correction is needed and what rule applies."
    }
  ],
  "vocabularySuggestions": [
    {
      "word": "original simple or repetitive word",
      "suggestion": "an advanced, idiomatic, or more fitting natural word",
      "explanation": "How this replacement elevates the elegance of the text."
    }
  ],
  "polishedVersion": "The entire paragraph fully polished, corrected, and written with elite fluency.",
  "translationOfPolished": "An elegant English translation of the polished paragraph."
}

Ensure the response is valid, well-formed JSON. IMPORTANT: Make sure all double quotes inside JSON string fields (such as "explanation", "critique", or "polishedVersion") are properly escaped with backslashes (e.g. \"word\") to prevent JSON syntax errors. If there are no errors or vocabulary suggestions, return an empty array for those fields.`;

      const critiqueSchema = {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          cefrLevel: { type: Type.STRING },
          critique: {
            type: Type.OBJECT,
            properties: {
              grammar: { type: Type.STRING },
              vocabulary: { type: Type.STRING },
              flow: { type: Type.STRING }
            },
            required: ["grammar", "vocabulary", "flow"]
          },
          errors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                correction: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["original", "correction", "explanation"]
            }
          },
          vocabularySuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["word", "suggestion", "explanation"]
            }
          },
          polishedVersion: { type: Type.STRING },
          translationOfPolished: { type: Type.STRING }
        },
        required: [
          "score",
          "cefrLevel",
          "critique",
          "errors",
          "vocabularySuggestions",
          "polishedVersion",
          "translationOfPolished"
        ]
      };

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: critiqueSchema
          }
        });
      } catch (firstError) {
        console.warn("Primary gemini-3.6-flash for composition critique failed. Attempting fallback to gemini-3.6-flash...");
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: critiqueSchema
          }
        });
      }

      if (!response.text) {
        throw new Error("No analysis received from the AI engine.");
      }

      const data = cleanAndParseJSON(response.text);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Composition critique error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze your composition." });
    }
  });

  // API Route: AI Quiz Session Summary
  app.post("/api/quiz-summary", async (req, res) => {
    try {
      const { score, totalQuestions, language, wrongAnswers } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ success: true, summary: "Congratulations on completing the quiz! Regular practice is the key to mastering your target language. Keep up the excellent work!" });
      }
      const client = getGeminiClient();
      
      const prompt = `The user just finished a ${language} quiz, scoring ${score} out of ${totalQuestions}. 
They answered these questions incorrectly (if any): ${JSON.stringify(wrongAnswers)}.
Provide a 3-sentence editorial summary of their progress today, including an analysis of their weak points based on the wrong answers. Write it in an elegant, professional, and encouraging tone. Return a raw JSON object with a 'summary' string field.`;

      const critiqueSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING }
        },
        required: ["summary"]
      };

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: critiqueSchema
          }
        });
      } catch (e) {
        response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: critiqueSchema
          }
        });
      }

      if (!response.text) {
         throw new Error("No text returned.");
      }
      const data = cleanAndParseJSON(response.text);
      res.json({ success: true, summary: data.summary });
    } catch (error: any) {
      console.error("Quiz summary error:", error);
      res.status(500).json({ error: "Failed to generate summary." });
    }
  });

  // Vite middleware for development or serving compiled files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
