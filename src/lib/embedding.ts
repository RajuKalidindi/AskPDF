import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getGeminiEmbeddings(text: string) {
	try {
		const geminiApiKey = process.env.GEMINI_API_KEY;
		if (!geminiApiKey) {
			throw new Error("Missing GEMINI_API_KEY in environment variables");
		}
		const genAI = new GoogleGenerativeAI(geminiApiKey);
		const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
		const result = await model.embedContent(text.replace(/\n/g, " "));
		return result.embedding.values as number[];
	} catch (error) {
		console.error("Error calling Gemini embeddings API", error);
		throw error;
	}
}
