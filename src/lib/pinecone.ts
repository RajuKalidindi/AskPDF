import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromDropbox } from "./dropbox-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
	Document,
	RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getGeminiEmbeddings } from "./embedding";
import md5 from "md5";
import { Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data";

export const getPinecone = async () => {
	const apiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
	if (!apiKey) {
		throw new Error("Missing Pinecone API key in environment variables");
	}
	const pinecone = new Pinecone({
		apiKey,
	});
	return pinecone;
};

type PDFPage = {
	pageContent: string;
	metadata: {
		loc: { page_number: number };
	};
};

export const loadPDF = async (file_key: string) => {
	console.log("Downloading PDF from Dropbox...");
	const file_path = await downloadFromDropbox(file_key);
	if (!file_path) {
		throw new Error("Error downloading file from Dropbox");
	}
	console.log("PDF downloaded to:", file_path);
	const loader = new PDFLoader(file_path);
	const pdf_pages = (await loader.load()) as unknown as PDFPage[];

	const docs = await Promise.all(pdf_pages.map((page) => docSplitter(page)));
	const embeddings = await Promise.all(docs.flat().map(embedDocuments));

	const client = await getPinecone();
	if (!process.env.NEXT_PUBLIC_PINECONE_INDEX) {
		throw new Error("Missing Pinecone index in environment variables");
	}
	const index = client.Index(
		process.env.NEXT_PUBLIC_PINECONE_INDEX,
		process.env.NEXT_PUBLIC_PINECONE_HOST
	);

	console.log("Inserting vectors into Pinecone...");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const chunks = (array: any, batchSize = 200) => {
		const chunks = [];

		for (let i = 0; i < array.length; i += batchSize) {
			chunks.push(array.slice(i, i + batchSize));
		}

		return chunks;
	};
	const recordChunks = chunks(embeddings);
	for (const chunk of recordChunks) {
		await index.upsert(chunk);
	}
	return docs[0];
};

export const truncateString = (str: string, bytes: number) => {
	const encoder = new TextEncoder();
	return new TextDecoder("utf-8").decode(encoder.encode(str).slice(0, bytes));
};

async function docSplitter(page: PDFPage) {
	// eslint-disable-next-line prefer-const
	let { pageContent, metadata } = page;
	pageContent = pageContent.replace(/\n/g, "");
	const splitter = new RecursiveCharacterTextSplitter();
	const docs = await splitter.splitDocuments([
		new Document({
			pageContent,
			metadata: {
				pageNumber: metadata.loc.page_number,
				text: truncateString(pageContent, 36000),
			},
		}),
	]);
	return docs;
}

async function embedDocuments(docs: Document) {
	try {
		const embedding = await getGeminiEmbeddings(docs.pageContent);
		const hash = md5(docs.pageContent);
		return {
			id: hash,
			values: embedding,
			metadata: {
				pageNumber: docs.metadata.pageNumber,
				text: docs.metadata.text,
			},
		} as Vector;
	} catch (error) {
		console.error("Error embedding documents", error);
	}
}
