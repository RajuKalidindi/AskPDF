import fs from "fs";
import { getDropboxClient } from "@/lib/dropbox";
import os from "os";

export async function downloadFromDropbox(file_key: string) {
	try {
		const dbx = await getDropboxClient();
		const response = await dbx.sharingGetSharedLinkFile({ url: file_key });
		console.log("Dropbox response:", response);
		const tempDir = os.tmpdir();
		const file_path = `${tempDir}/pdf-${Date.now()}.pdf`;

		// Try to extract the file content from available properties
		let fileContent: Buffer;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result: any = response.result;
		if (result.fileBinary) {
			fileContent = result.fileBinary as Buffer;
		} else if (result.fileBlob) {
			const blob = result.fileBlob;
			fileContent = Buffer.from(await blob.arrayBuffer());
		} else {
			throw new Error("No file content returned from Dropbox.");
		}

		fs.writeFileSync(file_path, fileContent);
		console.log("File saved to:", file_path);
		return file_path;
	} catch (error) {
		console.error("Error downloading file from Dropbox:", error);
		throw error;
	}
}
