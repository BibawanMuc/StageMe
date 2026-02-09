
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

async function fetchModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.version}) [${m.supportedGenerationMethods.join(', ')}]`);
            });
        } else {
            console.log("No models found in response:", data);
        }
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}

fetchModels();
