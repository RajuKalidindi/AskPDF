"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSideBarProps {
	chats: DrizzleChat[];
	chatId: number;
}

const ChatSideBar = ({ chats, chatId }: ChatSideBarProps) => {
	return (
		<div className="w-full h-full p-4 text-gray-200 bg-gray-900 overflow-y-auto">
			<div className="flex flex-col h-full gap-2">
				<div className="flex-1 overflow-y-auto">
					{chats.map((chat) => (
						<Link key={chat.id} href={`/chat/${chat.id}`}>
							<div
								className={cn(
									"rounded-lg p-3 text-slate-300 flex items-center",
									{
										"bg-blue-600 text-white":
											chat.id === chatId,
										"hover:text-white": chat.id !== chatId,
									}
								)}
							>
								<MessageCircle className="mr-2" />
								<p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
									{chat.pdfName}
								</p>
							</div>
						</Link>
					))}
				</div>
				<Link href="/">
					<Button className="w-full border-dashed border-white border flex items-center justify-center p-3 rounded-lg mt-2">
						<PlusCircle className="mr-2 w-4 h-4" />
						New Chat
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default ChatSideBar;
