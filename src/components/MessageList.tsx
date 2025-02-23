import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

interface MessageListProps {
	isLoading: boolean;
	messages: Message[];
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
	if (isLoading) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
				<ScaleLoader color="#2563EB" />
			</div>
		);
	}
	if (!messages) return <></>;
	return (
		<div className="flex flex-col gap-2 px-4">
			{messages.map((message) => {
				return (
					<div
						key={message.id}
						className={cn("flex", {
							"justify-end pl-10": message.role === "user",
							"justify-start pr-10": message.role === "system",
						})}
					>
						<div
							className={cn(
								"rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
								{
									"bg-blue-600 text-white":
										message.role === "user",
								}
							)}
						>
							<p>{message.content}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MessageList;
