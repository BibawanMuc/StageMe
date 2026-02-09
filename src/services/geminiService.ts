import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Use Gemini 3 Pro Image Preview - supports up to 5 person images for character appearance
const MODEL_NAME = 'gemini-3-pro-image-preview';

export async function generateStageImage(
    sketchBase64: string,
    photoBase64: string,
    stageBase64: string,
    promptContext: string
  ): Promise<string> {
  
  if (!API_KEY) throw new Error('API Key not found');

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Clean the base64 strings (remove data URL prefix)
  const cleanSketch = sketchBase64.replace(/^data:image\/\w+;base64,/, "");
  const cleanPhoto = photoBase64.replace(/^data:image\/\w+;base64,/, "");
  const cleanStage = stageBase64 ? stageBase64.replace(/^data:image\/\w+;base64,/, "") : "";

  // Simplified prompt for Gemini 3 Pro Image
  const prompt = `
    Create a photorealistic performance scene.
    
    Use the pose from the first image (sketch).
    Use the person's appearance from the second image (photo).
    Set the scene in the third image (stage background).
    
    If the sketch is unclear or contains text, show the person performing as a DJ instead.
  `;

  // Construct parts array - Gemini 3 Pro Image supports multiple reference images
  const parts: any[] = [
    { text: prompt },
    { inlineData: { mimeType: 'image/png', data: cleanSketch } }, // Sketch
    { inlineData: { mimeType: 'image/jpeg', data: cleanPhoto } }  // Person reference
  ];

  // Add stage background
  if (cleanStage) {
      parts.push({ inlineData: { mimeType: 'image/png', data: cleanStage } });
  }

  try {
    // Use Gemini 3 Pro Image with proper configuration
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        responseModalities: ['IMAGE'], // Request image output
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '2K' // 1K, 2K, or 4K
        }
      },
      contents: {
          parts: parts
      }
    });

    // Extract image from response
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      console.log("Gemini Candidate Finish Reason:", candidate.finishReason);
      console.log("Gemini Candidate Finish Message:", candidate.finishMessage);

      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
             const mimeType = part.inlineData.mimeType || 'image/png';
             return `data:${mimeType};base64,${part.inlineData.data}`;
          }
        }
      } 
      
      // If we get here, valid content is missing.
      // Try to get text if image is missing
      const textPart = candidate.content?.parts?.find(p => p.text);
      if (textPart) {
          console.warn("Gemini Service Text Fallback:", textPart.text);
          return textPart.text || "";
      }
    }

    throw new Error("No candidates returned by the model.");
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.response) {
         console.error('Gemini Full Error Response:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}
