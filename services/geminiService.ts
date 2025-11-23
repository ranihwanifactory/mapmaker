import { GoogleGenAI, Type } from "@google/genai";
import { POIType } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for consistent persona
const SYSTEM_INSTRUCTION = "당신은 창의적이고 친절한 도시 계획가이자 동화 작가입니다. 사용자가 만드는 동네 지도에 대해 재미있고 따뜻한 설명을 제공하거나, 새로운 장소를 제안해주세요. 한국어로 답변하세요.";

export const generatePlaceDescription = async (name: string, type: string, currentDesc: string): Promise<string> => {
  try {
    const prompt = `
      이 장소의 이름은 "${name}"이고, 유형은 "${type}"입니다.
      현재 설명: "${currentDesc}".
      이 장소에 대해 지도에 들어갈 만한 창의적이고 매력적인 1-2문장의 설명을 작성해주세요.
      마치 동화속 마을이나 살기 좋은 동네를 소개하듯이 따뜻한 어조로 작성해주세요.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text?.trim() || "설명을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 연결에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const suggestNeighborhoodPlaces = async (theme: string): Promise<Array<{ name: string; type: POIType; description: string }>> => {
  try {
    const prompt = `
      "${theme}" 테마를 가진 동네에 어울리는 장소 5군데를 추천해주세요.
      각 장소의 이름, 적절한 유형(HOUSE, APARTMENT, SHOP, PARK, SCHOOL, HOSPITAL, LANDMARK 중 하나), 그리고 짧은 설명을 포함해야 합니다.
      창의적이고 재미있는 이름으로 지어주세요.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(POIType) },
              description: { type: Type.STRING },
            },
            required: ["name", "type", "description"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};