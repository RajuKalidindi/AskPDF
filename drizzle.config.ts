// import type { Config } from "drizzle-kit";
// import * as dotenv from "dotenv";
// dotenv.config({ path: ".env" });
// export default {
// 	driver: "pglite",
// 	schema: "./src/lib/db/schema.ts",
// 	dbCredentials: {
//         url: process.env.DATABASE_URL!,
//       },
// } satisfies Config;

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/lib/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
