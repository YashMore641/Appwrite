# RecallX — Your Personal Memory Vault
> Built for the **Appwrite Databases Hackathon**

[![Appwrite](https://img.shields.io/badge/Backend-Appwrite%20TablesDB-F02E65?style=flat-square&logo=appwrite&logoColor=white)](https://appwrite.io)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![OCR](https://img.shields.io/badge/OCR-Tesseract.js-FFA500?style=flat-square)](https://tesseract.projectnaptha.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

**RecallX** is a lightweight, responsive personal knowledge and memory vault where users can save screenshots, images, PDFs, notes, web URLs, and code snippets, and effortlessly search them later without remembering filenames or where they originally found them.

---

## 1. Problem Statement

People encounter valuable information every day:
- A screenshot of a recipe in a chat or blog post.
- A PDF invoice, financial summary, or technical paper.
- A critical code snippet or shell script discovered on StackOverflow.
- A quick idea, list, or bookmark.

Traditional bookmarking tools store only URLs, and regular cloud storage stores raw files without indexing visual or document text. A week later, when the user searches for "chocolate cake" or "runway projections", the image or PDF is lost in a camera roll or download folder.

**RecallX solves this by:**
1. Extracting text client-side via **Tesseract.js OCR** (for screenshots & images) and **PDF.js** (for PDF documents).
2. Storing structured metadata, tags, and extracted text in **Appwrite TablesDB**.
3. Storing files safely in **Appwrite Storage** with user-specific permissions.
4. Providing instant, multi-field keyword search across titles, descriptions, tags, notes, code, URLs, and OCR-extracted text.

---

## 2. Key Features

- **Appwrite TablesDB Integration:** Uses the official Appwrite Web SDK with `TablesDB` (and graceful `Databases` fallback) to manage structured memory rows.
- **Client-Side OCR (Tesseract.js):** Automatically extracts text from uploaded images and screenshots with real-time status and progress indicators.
- **Client-Side PDF Text Extraction:** Parses selectable text from PDF documents page-by-page, and detects scanned/raster-only documents gracefully.
- **Editable OCR Refinement:** Allows users to review, correct, and edit the extracted text before saving.
- **Multi-Field Keyword Search:** Instant and debounced search matching titles, descriptions, tags, OCR text, notes, URLs, and code snippets, with highlighted matching terms.
- **Appwrite Storage & File Preview:** Uploads and serves image previews and PDF documents securely using Appwrite Storage bucket IDs and unique file IDs.
- **Light & Dark Mode:** Minimalist, high-contrast dark mode and soft-gray light mode with localStorage persistence.
- **Code Snippet Formatter:** Formats code snippets with language selection (JavaScript, Python, SQL, HTML, etc.), line numbering, and a 1-click clipboard copy button.
- **Secure Per-User Access Control:** Enforces Appwrite User ACLs (`Permission.read(Role.user(userId))`, `Permission.update(...)`, `Permission.delete(...)`) so each user can only access their own vault items.
- **Responsive & Accessible Design:** Collapsible sidebar for desktop screens, mobile drawer, tactile cards, and modal confirmation dialogs.

---

## 3. Architecture & Data Flow

```
                      +-----------------------------------+
                      |      RecallX Web Application      |
                      |          (React + Vite)           |
                      +-----------------+-----------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
        [Images / Screenshots]                               [PDFs]
                 |                                             |
         Tesseract.js OCR                                   PDF.js
    (Status & Progress Callback)                    (Page-by-Page Extraction)
                 |                                             |
                 +----------------------+----------------------+
                                        |
                             [Extracted Clean Text]
                                        |
                 +----------------------+----------------------+
                 |                                             |
      [Appwrite Storage API]                      [Appwrite TablesDB API]
    - storage.createFile()                      - tablesDb.createRow()
    - storage.getFilePreview()                  - tablesDb.listRows()
    - storage.getFileView()                     - tablesDb.updateRow()
    - storage.deleteFile()                      - tablesDb.deleteRow()
                 |                                             |
                 v                                             v
     Secure User-Scoped Bucket                     Memories Table Collection
         (fileId reference)                       (ACL: Role.user(userId))
```

---

## 4. Appwrite TablesDB Data Model

### Why TablesDB is Suitable for Memory Metadata
Appwrite TablesDB provides a structured relational document model with native indexing, typed attributes, and strict row-level security. 

Instead of storing bulky image binaries or large PDF blobs inside database rows, RecallX stores only the lightweight metadata, searchable extracted strings, and tags in TablesDB, referencing the binary in Appwrite Storage via `fileId`. This guarantees fast query execution, instant index lookups, and minimal bandwidth consumption.

### The `memories` Table Schema

| Attribute | Type | Size / Format | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `$id` | String | System ID | Auto | Unique row identifier generated by Appwrite (`ID.unique()`) |
| `userId` | String | 36 chars | Yes | Authenticated owner's identifier for row isolation |
| `title` | String | 255 chars | Yes | Memory title (e.g., "Chocolate Lava Cake Recipe") |
| `description` | String | 1000 chars | No | Short user-provided context or summary |
| `type` | String | 32 chars | Yes | Enum: `screenshot`, `image`, `pdf`, `note`, `url`, `code` |
| `tags` | String Array | Array of strings | No | Tags for filtering (e.g. `["recipe", "baking"]`) |
| `content` | String | 10000 chars | No | Plain-text note content or code snippet |
| `extractedText` | String | 20000 chars | No | Text extracted from images (OCR) or PDF documents |
| `url` | String | 1024 chars | No | Web link or original source URL |
| `fileId` | String | 36 chars | No | Appwrite Storage file identifier |
| `language` | String | 32 chars | No | Code language identifier (e.g., `javascript`, `python`) |
| `createdAt` | Datetime | ISO 8601 | Auto | Creation timestamp |
| `updatedAt` | Datetime | ISO 8601 | Auto | Last update timestamp |

### Indexes (Recommended for TablesDB)
- **`userId_idx`**: Key: `userId` (Type: `key`) — Fast retrieval of user-specific vault rows.
- **`type_idx`**: Key: `type` (Type: `key`) — Quick filtering by memory category.
- **`createdAt_idx`**: Key: `createdAt` (Type: `orderDesc`) — Chronological sorting.

---

## 5. Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# Appwrite Cloud Endpoint or Self-Hosted Instance
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

# Appwrite Project ID (Found in Appwrite Console > Project Settings)
VITE_APPWRITE_PROJECT_ID=your_project_id_here

# Appwrite Database ID
VITE_APPWRITE_DATABASE_ID=recallx_db

# Appwrite TablesDB Table / Collection ID
VITE_APPWRITE_TABLE_ID=memories

# Appwrite Storage Bucket ID
VITE_APPWRITE_BUCKET_ID=memories_vault
```

> **In-App Configuration Helper:**
> If you launch RecallX without editing `.env`, you can open the **"Setup Appwrite"** dialog directly in the top navigation bar or Settings page. You can input your Project ID, Endpoint, and Table parameters, click **"Test Connection"**, and save them securely in your browser's `localStorage`.

---

## 6. Local Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or later, v20+ recommended)
- npm or pnpm
- An [Appwrite Cloud](https://cloud.appwrite.io) account or local Appwrite instance

### Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "AppWrite Database Hackathon"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Appwrite project credentials
   ```

4. **Appwrite Project Setup (Console):**
   - In Appwrite Console, create a Project named **RecallX**.
   - Create a Web Platform with your hostname (e.g. `localhost`).
   - Create a Database with ID `recallx_db`.
   - Create a Table/Collection with ID `memories` and define the attributes listed in Section 4.
   - Under Settings > Permissions for `memories`, enable **Users** (or Document-level permissions).
   - Create a Storage Bucket with ID `memories_vault` (allowed file extensions: png, jpg, jpeg, webp, pdf; max size: 50MB).

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

6. **Build for Production:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 7. Screenshot and PDF Processing Workflow

### 1. Image & Screenshot Processing (OCR)
1. User drops or selects an image file (`PNG`, `JPG`, `WebP`).
2. An instant local preview is rendered via `FileReader`.
3. `src/utils/ocrExtractor.js` invokes `tesseract.js`'s recognition worker.
4. Real-time progress updates are reported to the UI (`Loading OCR core...`, `Recognizing text (65%)...`).
5. Extracted text is populated in an **editable preview area** so users can fix punctuation or formatting.
6. The image file is uploaded to Appwrite Storage with user-level read permissions.
7. The metadata row with `fileId` and `extractedText` is committed to TablesDB.

### 2. PDF Document Processing
1. User uploads a PDF document.
2. `src/utils/pdfExtractor.js` reads the file buffer using `pdfjs-dist`.
3. The extractor iterates through document pages, extracting text item strings.
4. If the extracted text has fewer than 20 characters across all pages, the app automatically flags a **Scanned Document Detected** notice, letting the user know that the PDF contains raster image pages.
5. The PDF is stored in Appwrite Storage, and its text is indexed in TablesDB.

---

## 8. Testing Instructions

### A. Testing Without Backend (Demo Preview)
1. Visit the Landing Page.
2. Scroll to the **Interactive Preview** section.
3. Test search keywords:
   - Type `"chocolate cake"` -> Surfaces Grandma's recipe screenshot through OCR text.
   - Type `"appwrite"` -> Surfaces the TablesDB code snippet.
   - Type `"finance"` -> Surfaces the Q3 PDF summary.
   - Click on any memory card to view full previews, copy notes, and inspect metadata.

### B. Testing With Appwrite Connected
1. Enter your Appwrite credentials in the `.env` file or via the in-app **TablesDB Setup** modal.
2. Click **Test Connection** to confirm connectivity.
3. Register a new account under **Sign Up**.
4. Click **Quick Capture > Screenshot** and upload a recipe or receipt image. Notice the OCR extraction progress bar.
5. Save the memory. It will appear on your Dashboard and in your Memory Vault.
6. Use the top search bar to search for any word that was inside the screenshot. RecallX will highlight and display the matching record.
7. Switch between **Light Mode** and **Dark Mode** using the sun/moon toggle in the top bar.

---

## 9. Limitations & Future Improvements

- **Keyword Search vs Semantic Search:** The current version uses client-side and SQL-like keyword tokenization across all metadata fields. While instant, fast, and free of paid API requirements, semantic vector search (e.g., using Appwrite Functions with embedding models) could be added to support queries like "sweet baking dish" matching "chocolate cake".
- **Multi-language OCR:** The current OCR configuration initializes English (`eng`). Future versions could include language selection for multilingual receipts and documents.
- **Batch Uploading:** Future iterations can support uploading multiple screenshots or documents simultaneously.
- **Client-Side Image Compression:** Pre-compressing large screenshot PNGs before Appwrite Storage upload to reduce storage bandwidth.

---

## 10. License

Released under the [MIT License](LICENSE). Built with ❤️ for the Appwrite Databases Hackathon.
