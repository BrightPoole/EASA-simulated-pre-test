
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateQuestions = async (subject: Subject, count: number, language: Language): Promise<Question[]> => {
  // Using gemini-3-pro-preview for complex EASA reasoning and high-quality aviation theory questions.
  const model = "gemini-3-pro-preview";
  const langName = language === 'de' ? 'German' : language === 'fr' ? 'French' : 'English';

  const prompt = `
    Generate ${count} multiple-choice questions for an EASA (European Union Aviation Safety Agency) pilot theory examination.
    The subject is: ${subject}.
    The language of the questions, options, and explanations must be strictly in ${langName}.
    
    Requirements:
    1. Questions should be challenging, suitable for PPL/ATPL level, following the standard EASA syllabus and ECQB style.
    2. Provide exactly 4 options per question.
    3. Indicate the correct index (0-3).
    4. Provide a brief but technically accurate explanation for the correct answer in ${langName}, citing the logic or regulation where applicable.
    5. Categorize each question into a specific sub-topic (e.g. for Air Law: 'Personnel Licensing', 'Rules of the Air', 'Altimetry').
  `;

  // Retry configuration
  const MAX_RETRIES = 3;
  const BASE_DELAY = 2000;

  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING }
              },
              required: ["questionText", "options", "correctOptionIndex", "explanation", "topic"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      
      return data.map((item: any, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        questionText: item.questionText,
        options: item.options,
        correctOptionIndex: item.correctOptionIndex,
        explanation: item.explanation,
        topic: item.topic
      }));

    } catch (error: any) {
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;

      const status = error.status || error.code;
      const isRateLimit = status === 429 || (error.message && error.message.includes('429'));
      const isServerBusy = status === 503 || status === 500;

      if ((isRateLimit || isServerBusy) && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await wait(delay);
        continue;
      }
      break;
    }
  }

  let errorMessage = "Could not generate exam questions. Please check your connection or API key.";
  if (lastError) {
    const msg = lastError.message || "";
    if (msg.includes('429')) {
      errorMessage = "Server is busy (Quota Exceeded). Please try again in a minute.";
    } else if (msg.includes('503')) {
      errorMessage = "AI Service is temporarily unavailable. Please try again later.";
    }
  }
  
  throw new Error(errorMessage);
};
