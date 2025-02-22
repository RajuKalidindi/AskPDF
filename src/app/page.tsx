import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
	const { userId } = await auth();
	const isAuth = !!userId;
	let firstChat;
	if (userId) {
		firstChat = await db
			.select()
			.from(chats)
			.where(eq(chats.userId, userId));
		if (firstChat) {
			firstChat = firstChat[0];
		}
	}
	return (
		<div className="w-screen min-h-screen bg-gradient-to-r bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100 to-violet-100 relative">
			<header className="absolute top-3 left-3 flex items-center gap-0.5">
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
			</header>

			<div className="absolute top-3 right-3">
				<UserButton showName={true} />
			</div>

			<main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="flex flex-col items-center text-center">
					<div className="flex items-center justify-center">
						<h2 className="text-slate-900 text-5xl font-semibold">
							Chat with any{" "}
							<Image
								src="/pdf2.png"
								alt="PDF icon"
								width={128}
								height={128}
								className="inline-block align-middle ml-2"
							/>
						</h2>
					</div>
					<p className="max-w-xl mt-2 text-lg text-slate-600">
						Engage in AI-powered conversations to effortlessly
						understand complex documents and reveal key insights.
					</p>
					<div className="flex mt-4">
						{isAuth && firstChat && (
							<Link href={`/chat/${firstChat.id}`}>
								<Button>
									Go to chats <ArrowRight />
								</Button>
							</Link>
						)}
					</div>
					<div className="w-full mt-4">
						{isAuth ? (
							<FileUpload />
						) : (
							<Link href="/sign-in">
								<Button>
									Login to get Started! <LogIn />
								</Button>
							</Link>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
