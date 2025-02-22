"use client";
import React, { useState } from "react";
import HashLoader from "react-spinners/HashLoader";

interface PDFViewerProps {
	pdf_url: string;
}

const PDFViewer = ({ pdf_url }: PDFViewerProps) => {
	const [loading, setLoading] = useState(true);

	const rawUrl = pdf_url.includes("dl=0")
		? pdf_url.replace("dl=0", "raw=1")
		: pdf_url;

	return (
		<div className="relative w-full h-full">
			{loading && (
				<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
					<HashLoader color="#2563EB" size={60} />
				</div>
			)}
			<iframe
				src={rawUrl}
				className="w-full h-full"
				onLoad={() => setLoading(false)}
			/>
		</div>
	);
};

export default PDFViewer;
