
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const envConfig = dotenv.config({ path: '.env.local' });
const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Error: VITE_GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = 'gemini-2.5-flash-image'; // Testing the model in question

async function testGeneration() {
    console.log(`Testing model: ${MODEL_NAME}`);

    // Load placeholder images (mocking sketch/photo/stage)
    // We'll just read the stage images we know exist, or creating a dummy buffer if needed.
    // For reproduction, proper paths are needed.
    // Assuming running from project root.
    
    // We need 3 images. Let's use the stage images for all 3 for simplicity 
    // (the model doesn't know they are stages, just bytes).
    const stage1Path = path.join('public', 'stages', 'stage1.png');
    
    if (!fs.existsSync(stage1Path)) {
        console.error("Stage 1 image not found at:", stage1Path);
        return;
    }

    const imageBuffer = fs.readFileSync(stage1Path);
    const base64Image = imageBuffer.toString('base64');
    
    function fileToPart(data) {
        return {
            inlineData: {
                data: data,
                mimeType: "image/png"
            }
        };
    }

    const sketchPart = fileToPart(base64Image);
    const photoPart = fileToPart(base64Image);
    const stagePart = fileToPart(base64Image);

    const prompt = "Create a photorealistic image. Just a test.";

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    try {
        console.log("Sending request with 3 images...");
        const result = await model.generateContent([
            prompt,
            sketchPart,
            photoPart,
            stagePart
        ]);

        const response = await result.response;
        
        console.log("\n--- FULL RESPONSE STRUCTURE ---");
        console.dir(response, { depth: null });
        
        console.log("\n--- TEXT CONTENT ---");
        try {
            console.log(response.text());
        } catch (e) {
            console.log("No text content.");
        }

    } catch (e) {
        console.error("\nERROR:", e.message);
        if (e.response) {
             console.dir(e.response, { depth: null });
        }
    }
}

testGeneration();
