import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import Chat from "@/components/Chat";

interface ChatPageProps {
	params: {
		chatId: string;
	};
}

const ChatPage = async (props: ChatPageProps) => {
	const params = await Promise.resolve(props.params);
	const { chatId } = params;
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

	const currentChat = userChats.find((chat) => chat.id === chatIdNumber);

	return (
		<div className="flex h-screen bg-gray-50">
			<aside className="h-full w-1/5 border-r border-gray-200">
				<ChatSideBar chats={userChats} chatId={chatIdNumber} />
			</aside>
			<main className="h-full flex flex-1 overflow-hidden">
				<section className="w-3/5 p-4 overflow-y-auto">
					<PDFViewer pdf_url={currentChat?.pdfUrl ?? ""} />
				</section>
				<section className="w-2/5 border-l border-gray-200 p-4 overflow-y-auto">
					<Chat chatId={chatIdNumber} />
				</section>
			</main>
		</div>
	);
};

export default ChatPage;
