import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { file_key, file_name } = await req.json();
		console.log(file_key, file_name);
		return NextResponse.json({ message: "success" });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "internal server error" },
			{ status: 500 }
		);
	}
}
