# StageMe - Sketch to Stage Performance Generator

**Transform your sketches into professional stage performances using AI!**

StageMe is an interactive web application that combines user sketches, selfies, and stage backgrounds to generate photorealistic performance scenes using Google's Gemini 3 Pro Image AI.

## ✨ Features

- 📸 **Selfie Integration** - Capture or upload your photo to become the performer
- 🎨 **Interactive Drawing Canvas** - Sketch your desired pose or action
- 🎭 **Multiple Stage Backgrounds** - Choose from various professional stage environments
- 🤖 **AI-Powered Generation** - Uses Gemini 3 Pro Image (supports up to 5 person references)
- 💾 **Persistent Storage** - All generations saved to Supabase
- 📱 **QR Code Download** - Easy sharing and downloading of results
- 🖼️ **High Resolution** - Generates images at 2K resolution (upgradable to 4K)

## 🚀 Tech Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **AI Model:** Google Gemini 3 Pro Image Preview (`gemini-3-pro-image-preview`)
- **Backend:** Supabase (PostgreSQL + Storage)
- **SDK:** `@google/genai` (New Gemini SDK)

## 🎯 How It Works

1. **Capture/Upload Photo** - Take a selfie or upload your photo
2. **Draw Your Pose** - Sketch the action or pose you want to perform
3. **Select Stage** - Choose your performance environment
4. **Generate** - AI combines all three inputs into a photorealistic scene

### AI Processing Pipeline

The app uses a three-image input system:

- **Image 1 (Sketch):** The RIG/SKELETON - defines the pose
- **Image 2 (Photo):** The TEXTURE/SKIN - provides your appearance
- **Image 3 (Stage):** The ENVIRONMENT - sets the background scene

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google AI Studio API key (for Gemini 3 Pro Image)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd _PX-sketch2real
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   Run the SQL schema in your Supabase SQL editor:

   ```sql
   -- Create table
   CREATE TABLE pAIntBoard (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     drawing_url TEXT,
     result_url TEXT,
     photo_url TEXT,
     prompt JSONB,
     stage TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create storage buckets
   INSERT INTO storage.buckets (id, name, public)
   VALUES
     ('pAIntBoard-sketches', 'pAIntBoard-sketches', true),
     ('pAIntBoard-results', 'pAIntBoard-results', true),
     ('pAIntBoard-photos', 'pAIntBoard-photos', true);

   -- Set RLS policies (public access for kiosk mode)
   ALTER TABLE pAIntBoard ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Public read access" ON pAIntBoard FOR SELECT USING (true);
   CREATE POLICY "Public insert access" ON pAIntBoard FOR INSERT WITH CHECK (true);
   ```

5. **Add stage images**

   Place your stage background images in `public/stages/`:
   - `stage1.png`
   - `stage2.png`
   - `stage3.png`

## 🎮 Usage

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Open in browser**

   ```
   http://localhost:5173
   ```

3. **Create your performance**
   - Click "Take Photo" or "Upload Photo"
   - Draw your desired pose on the canvas
   - Select a stage background
   - Click "Generate Image"
   - Download or share via QR code

## 🔧 Configuration

### Image Resolution

Edit `src/services/geminiService.ts` to change output quality:

```typescript
imageConfig: {
  aspectRatio: '1:1', // Options: '1:1', '16:9', '9:16', etc.
  imageSize: '2K'     // Options: '1K', '2K', '4K'
}
```

### Safety Settings

The app uses `BLOCK_NONE` for all safety categories to allow creative freedom. Adjust in `geminiService.ts` if needed.

## 📚 Key Components

- **`App.tsx`** - Main application logic and state management
- **`CameraCapture.tsx`** - Webcam integration and photo upload
- **`DrawingCanvas.tsx`** - Interactive sketch canvas
- **`StageSelector.tsx`** - Stage background selection
- **`ResultView.tsx`** - Display results with QR code
- **`geminiService.ts`** - Gemini API integration
- **`supabaseService.ts`** - Database and storage operations

## 🚨 Important Notes

### Model Selection

This app uses **`gemini-3-pro-image-preview`** specifically because:

- ✅ Supports up to 5 person reference images
- ✅ Designed for professional asset production
- ✅ Allows user selfies (unlike `gemini-2.5-flash-image`)
- ✅ Generates up to 4K resolution

**Do not use `gemini-2.5-flash-image`** - it has strict safety filters that block user-uploaded photos in pose-transfer scenarios.

## 🐛 Troubleshooting

### "IMAGE_OTHER" Error

- Ensure you're using `gemini-3-pro-image-preview` model
- Check that `responseModalities` includes `'IMAGE'`
- Verify API key has access to Gemini 3 Pro Image

### Camera Not Working

- Ensure HTTPS or localhost
- Check browser permissions for camera access

### Images Not Saving

- Verify Supabase storage buckets are public
- Check RLS policies allow public insert

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- Google Gemini API for AI image generation
- Supabase for backend infrastructure
- React and Vite communities
