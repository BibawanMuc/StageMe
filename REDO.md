# REDO: Selfie-to-Real App Specification

This document outlines the requirements and implementation steps to recreate the current **Sketch2Real AI** app with a modified workflow focusing on **Selfie Integration**.

## 🎯 Core Concept

Instead of using stock player images, the user provides their own **Photo/Selfie**. The app then combines:

1.  **User Photo** (Identity/Texture)
2.  **User Sketch** (Pose/Rig)
3.  **Selected Stage** (Environment/Background)

The AI will "wrap" the user's photo onto the sketched pose within the chosen stage.

---

## 🛠 Tech Stack (Updated)

- **Frontend:** React 19 + Vite (TypeScript)
- **Styling:** Tailwind CSS
- **AI:** Google Gemini 3 Pro Image Preview (`@google/genai`)
- **Backend:** Supabase (Database + Storage)

---

## 📱 User Flow & UI Changes

### 1. Input Panel (Redesigned)

The `InputPanel` will be the primary control center.

- **Input 1: Photo/Selfie**
  - **Action:** Button to "Take Selfie" (Camera Modal) or "Upload Photo". The upload comes from a different source than the sketch. THe source for the upload could be a mobile device.
  - **Display:** Thumbnail of the active photo.
  - **Requirement:** Must be converted to Base64 for the API.
- **Input 2: Stage Selection**
  - **Type:** Dropdown Menu.
  - **Options:** "Stage 1", "Stage 2", "Stage 3".
  - **Logic:** Maps to specific background environment images (e.g., `stage1.png`).

### 2. Canvas (Sketching)

- **Unchanged.** The user draws the desired pose.
- **Logic:** This sketch serves as the "Skeleton" or "Rig".

### 3. Result View

- **Unchanged.** Shows the generated image.
- **QR Code:** Generated for download.

---

## 💾 Data & Persistence Strategy

### Supabase Schema Updates

The current `pAIntBoard` table is mostly sufficient, but we should add a column for the selfie.

**Table:** `pAIntBoard`

- `id`: uuid (Primary Key)
- `drawing_url`: text (Path to sketch)
- `result_url`: text (Path to generated image)
- `photo_url`: text (**NEW** - Path to user's uploaded/taken photo)
- `prompt`: jsonb (Full prompt text + settings)
- `stage`: text (Selected Stage)

### Storage Buckets

- `pAIntBoard/sketches`: Store the user's drawing.
- `pAIntBoard/results`: Store the AI output.
- `pAIntBoard/photos`: (**NEW**) Store the user's uploaded selfie.

---

## 🧠 AI Prompt Logic (Gemini 3 Pro Image) ✅ IMPLEMENTED

**Model:** `gemini-3-pro-image-preview`

This model was chosen because it:

- Supports up to 5 person reference images for character appearance
- Is designed for professional asset production
- Allows user-uploaded selfies (unlike `gemini-2.5-flash-image` which blocks them)
- Generates images up to 4K resolution

### Current Implementation

The prompt architecture is hierarchical:

1.  **Image 1 (Sketch):** Defined as the **POSE REFERENCE**.
    - _Instruction:_ "Use the pose from the first image (sketch)."
2.  **Image 2 (Selfie):** Defined as the **PERSON'S APPEARANCE**.
    - _Instruction:_ "Use the person's appearance from the second image (photo)."
3.  **Image 3 (Stage):** Defined as the **ENVIRONMENT**.
    - _Instruction:_ "Set the scene in the third image (stage background)."

**Fallback:** If the sketch is unclear or contains text, the AI generates a "DJ performing" pose instead.

**Configuration:**

```typescript
config: {
  responseModalities: ['IMAGE'],
  imageConfig: {
    aspectRatio: '1:1',
    imageSize: '2K' // Can be upgraded to '4K'
  }
}
```

---

## 📝 Implementation Checklist

### Step 1: Project Scaffolding ✅ COMPLETED

- [x] Initialize Vite + React + TypeScript.
- [x] Install dependencies: `@google/genai`, `@supabase/supabase-js`, `lucide-react`, `react-qr-code`.
- [x] Setup Tailwind CSS.

### Step 2: Supabase Setup ✅ COMPLETED

- [x] Create `pAIntBoard` table with the new `photo_url` column.
- [x] Enable Storage buckets for `sketches`, `results`, and `photos`.
- [x] Set RLS policies for public read/write (for kiosk mode).

### Step 3: Service Layer ✅ COMPLETED

- [x] **`supabaseService.ts`**: Add `uploadPhoto` function. Update `saveGenerationRecord` to handle the extra URL.
- [x] **`geminiService.ts`**:
  - Update function signature to accept `photoBase64`.
  - Modify prompt to strictly separate "Pose Source" vs "Identity Source".
  - **CRITICAL:** Use `gemini-3-pro-image-preview` model (not `gemini-2.5-flash-image`).

### Step 4: UI Components ✅ COMPLETED

- [x] **`CameraCapture.tsx`** (New Component):
  - Use `navigator.mediaDevices.getUserMedia` to access webcam.
  - Capture frame to Canvas -> Base64.
- [x] **`InputPanel.tsx`**:
  - Integrate `CameraCapture`.
  - Add "Stage" dropdown.
- [x] **`App.tsx`**:
  - Manage state for `photoImage` (Base64).
  - Orchestrate the generation flow: `Prompt(Sketch + Photo + Stage) -> Gemini`.
  - Orchestrate the save flow: `Upload(Sketch) + Upload(Photo) + Upload(Result) -> Save Record`.

---

## 🚀 Future-Proofing

- **Face Preservation:** If identity preservation is critical, consider enabling face-detection in the prompt (e.g., "Maintain high fidelity to the face in Image 2").
- **Stage Config:** Store stage image paths in a config object so they are easy to swap out.
