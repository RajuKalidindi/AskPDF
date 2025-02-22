"use client";
import React, { useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import { db } from "@/lib/db";
import { messages as _messages } from "@/lib/db/schema";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

interface ChatProps {
	chatId: number;
}

const Chat = ({ chatId }: ChatProps) => {
	const { data, isLoading } = useQuery({
		queryKey: ["chat", chatId],
		queryFn: async () => {
			const response = await axios.post<Message[]>("/api/get-messages", {
				chatId,
			});
			return response.data;
		},
	});

	const { input, handleInputChange, handleSubmit, messages } = useChat({
		api: "/api/chat",
		body: {
			chatId,
		},
		initialMessages: data || [],
		onFinish: (message) => {
			db.insert(_messages)
				.values({
					chatId,
					content: message.content,
					role: "model",
				})
				.catch((error) => console.error("Error saving message", error));
		},
	});

	const messageContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messageContainerRef.current) {
			messageContainerRef.current.scrollTop =
				messageContainerRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className="flex flex-col h-full">
			<header className="p-2 flex items-center gap-0.5">
				<h1 className="mt-1 font-bold text-slate-900 leading-none">
					Ask
				</h1>
				<Image
					src="/pdf.png"
					alt="PDF icon"
					width={36}
					height={36}
					className="object-contain"
				/>
				<h1 className="mt-1 ml-2 font-bold text-slate-900 leading-none">
					Chat
				</h1>
				<div className="absolute top-6 right-4">
					<UserButton />
				</div>
			</header>

			<div
				ref={messageContainerRef}
				className="flex-1 overflow-y-auto bg-gray-100 p-4 flex flex-col-reverse"
			>
				<MessageList messages={messages} isLoading={isLoading} />
			</div>

			<form onSubmit={handleSubmit} className="p-4 bg-gray-50">
				<div className="flex">
					<Input
						value={input}
						onChange={handleInputChange}
						placeholder="Ask any question..."
						className="flex-1"
					/>
					<Button type="submit" className="ml-2 bg-blue-600">
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</form>
		</div>
	);
};

export default Chat;
