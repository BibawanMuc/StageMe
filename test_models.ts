
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars manually
const envLocalPath = path.resolve(process.cwd(), '.env.local');
let API_KEY = '';

try {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
  if (match && match[1]) {
    API_KEY = match[1].trim();
  }
} catch (e) {
  console.error("Could not read .env.local", e);
}

if (!API_KEY) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log("Using API Key ending in: ..." + API_KEY.slice(-4));
    
    // Test gemini-1.5-flash
    console.log("\nTesting 'gemini-1.5-flash'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("SUCCESS: 'gemini-1.5-flash' responded:", response.text().slice(0, 50) + "...");
    } catch (e) {
        console.error("FAILURE: 'gemini-1.5-flash' error:", e.message);
    }

    // Test gemini-2.0-flash-exp
    console.log("\nTesting 'gemini-2.0-flash-exp'...");
    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result2 = await model2.generateContent("Hello?");
        const response2 = await result2.response;
        console.log("SUCCESS: 'gemini-2.0-flash-exp' responded:", response2.text().slice(0, 50) + "...");
    } catch (e) {
        console.error("FAILURE: 'gemini-2.0-flash-exp' error:", e.message);
    }

  } catch (error) {
    console.error("General Error:", error.message);
  }
}

listModels();
