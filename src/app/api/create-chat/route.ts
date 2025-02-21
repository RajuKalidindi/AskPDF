import { NextResponse } from "next/server";
import { loadPDF } from "@/lib/pinecone";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}
	try {
		const { file_key, file_name } = await req.json();
		console.log("Received file_key:", file_key, "file_name:", file_name);
		await loadPDF(file_key);
		const chat_id = await db
			.insert(chats)
			.values({
				pdfName: file_name,
				pdfUrl: file_key,
				userId,
			})
			.returning({
				id: chats.id,
			});
		return NextResponse.json({ chat_id: chat_id[0].id }, { status: 200 });
	} catch (error) {
		console.error("Error in /api/create-chat route:", error);
		return NextResponse.json(
			{ error: "internal server error" },
			{ status: 500 }
		);
	}
}
