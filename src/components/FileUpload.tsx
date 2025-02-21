"use client";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { getDropboxClient } from "@/lib/dropbox";
import { useRouter } from "next/navigation";

const FileUpload = () => {
	const router = useRouter();
	const [uploading, setUploading] = useState(false);

	const { mutate } = useMutation({
		mutationFn: async ({
			file_key,
			file_name,
		}: {
			file_key: string;
			file_name: string;
		}) => {
			const response = await axios.post("/api/create-chat", {
				file_key,
				file_name,
			});
			return response.data;
		},
	});

	const { getRootProps, getInputProps } = useDropzone({
		accept: { "application/pdf": [".pdf"] },
		maxFiles: 1,
		onDrop: async (acceptedFiles) => {
			console.log("acceptedFiles", acceptedFiles);
			const file = acceptedFiles[0];
			if (file.size > 10 * 1024 * 1024) {
				toast.error("Please upload a smaller file");
				return;
			}
			try {
				setUploading(true);
				const dbx = await getDropboxClient();
				const data = await dbx.filesUpload({
					path: `/${file.name}`,
					contents: file,
				});
				const path = data.result.path_lower;
				if (!path) {
					toast.error("Error: file path is undefined");
					setUploading(false);
					return;
				}
				let file_key;
				try {
					const createLinkResponse =
						await dbx.sharingCreateSharedLinkWithSettings({ path });
					file_key = createLinkResponse.result.url;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} catch (error: any) {
					if (
						error.error?.error_summary?.includes(
							"shared_link_already_exists"
						)
					) {
						const listLinksResponse =
							await dbx.sharingListSharedLinks({
								path,
								direct_only: true,
							});
						file_key = listLinksResponse.result.links[0]?.url;
						if (!file_key)
							throw new Error("No existing shared link found");
					} else {
						throw new Error("Error creating shared link");
					}
				}
				const file_name = file.name;
				console.log("File uploaded to Dropbox:", file_key, file_name);
				if (!file_key || !file_name) {
					toast.error("Error uploading file");
					return;
				}

				mutate(
					{ file_key, file_name },
					{
						onSuccess: ({ chat_id }) => {
							toast.success("Chat created successfully");
							router.push(`/chat/${chat_id}`);
						},
						onError: (error) => {
							toast.error("Error creating chat");
							console.error(error);
						},
					}
				);
				console.log("File uploaded successfully");
			} catch (error) {
				console.error(error);
				toast.error("Upload failed");
			} finally {
				setUploading(false);
			}
		},
	});

	return (
		<div className="p-2 bg-white rounded-xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
			<div
				{...getRootProps({
					className:
						"border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
				})}
			>
				<input {...getInputProps()} />
				{uploading ? (
					<>
						<Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
						<p className="mt-2 text-sm text-slate-400">
							Summoning digital ninjas to handle your PDF...
						</p>
					</>
				) : (
					<>
						<Inbox className="w-10 h-10 text-blue-500" />
						<p className="mt-2 text-sm text-slate-400">
							Drop your PDF here
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default FileUpload;
