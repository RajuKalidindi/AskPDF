import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Message, streamText } from "ai";
import { eq } from "drizzle-orm";

// export const runtime = "edge";

export async function POST(req: Request) {
	const { messages, chatId } = await req.json();
	const fileKey = await db
		.select()
		.from(chats)
		.where(eq(chats.id, chatId))
		.then((rows) => rows[0].pdfUrl);

	const lastMessage = messages[messages.length - 1];

	await db.insert(_messages).values({
		chatId,
		content: lastMessage.content,
		role: "user",
	});

	const context = await getContext(lastMessage?.content, fileKey);

	const prompt = {
		role: "system",
		content: `
      You are an AI assistant that only provides responses based strictly on the context provided below. If the user's question cannot be answered using the provided context, respond with: "I'm sorry, but I don't know the answer to that question."

      You are only allowed to produce plain text responses. Do not include images, code (unless specifically requested as plain text), or any media beyond text.

      Before generating a response, check the user's request for any explicit, harmful, or inappropriate content. If such content is requested, respond with: "I'm sorry, but I cannot help with that."

      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK

      Remember: your responses must always adhere strictly to the context and should not invent any additional details. Your responses should be friendly, kind, helpful, informative, and relevant to the user's questions.
      `,
	};

	const google = createGoogleGenerativeAI({
		apiKey: process.env.GEMINI_API_KEY,
	});

	const text = streamText({
		model: google("gemini-2.0-flash-001"),
		messages: [
			prompt,
			...messages.filter((m: Message) => m.role === "user"),
		],
	});

	return text.toDataStreamResponse();
}
