import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),

    user: {
        modelName: "users",

        additionalFields: {
            firstName: {
                type: "string",
                required: true,
                input: true,
            },
            surname: {
                type: "string",
                required: true,
                input: true,
            },
            teamId: {
                type: "string",
                required: true,
                input: true,
            },
            role: {
                type: "string",
                required: true,
                input: true,
            },
        },
    },

    emailAndPassword: {
        enabled: true,
    },
});
