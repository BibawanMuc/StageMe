
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

    // Test imagen-3.0-generate-001
    console.log("\nTesting 'imagen-3.0-generate-001'...");
    try {
        const model4 = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
        // Imagen prompts are usually just text.
        const result4 = await model4.generateContent("A cute cat");
        const response4 = await result4.response;
        console.log("SUCCESS: 'imagen-3.0-generate-001' responded:", JSON.stringify(response4));
    } catch (e) {
        console.error("FAILURE: 'imagen-3.0-generate-001' error:", e.message);
    }

listModels();
