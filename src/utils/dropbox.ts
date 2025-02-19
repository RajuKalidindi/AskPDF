import { Dropbox } from "dropbox";

interface DropboxTokens {
	access_token: string;
	refresh_token: string;
	expires_at: number;
}

let dropboxTokens: DropboxTokens | null = null;

export async function getDropboxClient(): Promise<Dropbox> {
	if (
		!process.env.NEXT_PUBLIC_DROPBOX_APP_KEY ||
		!process.env.NEXT_PUBLIC_DROPBOX_APP_SECRET ||
		!process.env.NEXT_PUBLIC_DROPBOX_REFRESH_TOKEN
	) {
		throw new Error("Missing Dropbox credentials in environment variables");
	}

	// If we haven't fetched a token yet or if it's expired, refresh it.
	if (!dropboxTokens || Date.now() >= dropboxTokens.expires_at) {
		try {
			const response = await fetch(
				"https://api.dropbox.com/oauth2/token",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						grant_type: "refresh_token",
						refresh_token:
							process.env.NEXT_PUBLIC_DROPBOX_REFRESH_TOKEN,
						client_id: process.env.NEXT_PUBLIC_DROPBOX_APP_KEY,
						client_secret:
							process.env.NEXT_PUBLIC_DROPBOX_APP_SECRET,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to refresh token: ${response.statusText}`
				);
			}

			const data = await response.json();

			dropboxTokens = {
				access_token: data.access_token,
				refresh_token:
					data.refresh_token || process.env.DROPBOX_REFRESH_TOKEN,
				expires_at: Date.now() + data.expires_in * 1000,
			};

			console.log("Successfully refreshed Dropbox access token");
		} catch (error) {
			console.error("Error refreshing Dropbox token:", error);
			throw error;
		}
	}

	return new Dropbox({
		accessToken: dropboxTokens.access_token,
	});
}
