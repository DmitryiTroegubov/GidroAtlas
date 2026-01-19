import 'dotenv/config';
import fs from 'fs';
import path from 'path';

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

async function main() {
    try {
        console.log("Starting ingestion script...");

        // 1. Load Environment Variables
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_API_KEY) {
            throw new Error(
                "Missing environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GOOGLE_API_KEY"
            );
        }

        // 2. Initialize Supabase Client
        console.log("Initializing Supabase client...");
        const client = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY
        );

        // 3. Load PDFs
        console.log("Loading PDFs from ./documents...");
        const docsDir = "./documents";
        const files = fs.readdirSync(docsDir).filter(file => file.endsWith(".pdf"));

        const docs = [];
        for (const file of files) {
            const filePath = path.join(docsDir, file);
            const loader = new PDFLoader(filePath);
            const loadedDocs = await loader.load();
            docs.push(...loadedDocs);
        }

        console.log(`Loaded ${docs.length} documents.`);

        if (docs.length === 0) {
            console.log("No documents found in ./documents. Exiting.");
            return;
        }

        // 4. Split Text
        console.log("Splitting text...");
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const splitDocs = await splitter.splitDocuments(docs);
        console.log(`Split into ${splitDocs.length} chunks.`);

        // 5. Initialize Embeddings
        console.log("Initializing embeddings...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "embedding-001",
            apiKey: GOOGLE_API_KEY,
        });

        // 6. Store in Supabase
        console.log("Storing embeddings in Supabase...");
        await SupabaseVectorStore.fromDocuments(
            splitDocs,
            embeddings,
            {
                client,
                tableName: "documents",
                queryName: "match_documents",
            }
        );

        console.log("Done! Ingestion complete.");
    } catch (error) {
        console.error("Error during ingestion:", error);
        process.exit(1);
    }
}

main();
