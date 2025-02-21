import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";

interface ChatPageProps {
	params: {
		chatId: string;
	};
}

const ChatPage = async ({ params: { chatId } }: ChatPageProps) => {
	const { userId } = await auth();
	if (!userId) {
		redirect("/sign-in");
	}

	const chatIdNumber = parseInt(chatId, 10);

	const userChats = await db
		.select()
		.from(chats)
		.where(eq(chats.userId, userId));

	if (
		!userChats ||
		userChats.length === 0 ||
		!userChats.some((chat) => chat.id === chatIdNumber)
	) {
		redirect("/");
	}

	return <div>Chat Page {chatId}</div>;
};

export default ChatPage;
