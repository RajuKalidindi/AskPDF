import { Pinecone } from "@pinecone-database/pinecone";
import { convertToASCII } from "./utils";
import { getGeminiEmbeddings } from "./embedding";

export async function getMatchesFromEmbeddings(
	embeddings: number[],
	fileKey: string
) {
	try {
		const client = new Pinecone({
			apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
		});
		if (!process.env.NEXT_PUBLIC_PINECONE_INDEX) {
			throw new Error("Missing Pinecone index in environment variables");
		}
		const index = client.index(process.env.NEXT_PUBLIC_PINECONE_INDEX);
		const namespace = index.namespace(convertToASCII(fileKey));

		const queryResponse = await namespace.query({
			topK: 5,
			vector: embeddings,
			includeValues: false,
			includeMetadata: true,
		});
		return queryResponse.matches || [];
	} catch (error) {
		console.log("error querying embeddings", error);
		throw error;
	}
}

interface Metadata {
	text: string;
	pageNumber: number;
}

export async function getContext(query: string, fileKey: string) {
	const queryEmbeddings = await getGeminiEmbeddings(query);
	const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

	const qualifyingDocs = matches.filter(
		(match) => match.score && match.score > 0.3
	);

	const docs = qualifyingDocs.map((match) =>
		match.metadata ? (match.metadata as unknown as Metadata).text : ""
	);
	return docs.join("\n").substring(0, 3000);
}
