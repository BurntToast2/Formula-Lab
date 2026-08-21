"use server";

import { db } from "@/db";
import { invitations, users, teams } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";

import { z } from "zod";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";

const emailSchema = z.email().endsWith("@setu.ie");

export async function createInvitation(email: string){
    let result = emailSchema.safeParse(email);

    if (result.success){
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await db.insert(invitations).values({
            email, token, expiresAt
        });

        return true;
    }
    return false;
}

export async function getInvitationByToken(token: string){
    const invitation = await db
        .select()
        .from(invitations)
        .where(
                and(
                    eq(invitations.token, token),
                    isNull(invitations.acceptedAt),
                    gt(invitations.expiresAt, new Date()),
                ),
        )
        .limit(1);

    return invitation[0] ?? null;
}

const signUpSchema = z.object({
    firstName: z.string().min(2).max(30),
    surname: z.string().min(2).max(30),
    password: z.string().min(7).max(30),
    teamName: z.string().min(1, "Please select a team"),
});

export async function validateSignUpCredentials(
    firstName: string,
    surname: string,
    password: string,
    teamName: string
) {
    const result = signUpSchema.safeParse({
        firstName,
        surname,
        password,
        teamName,
    });
    if (!result.success) {
        return {
            success: false as const,
            errors: z.flattenError(result.error).fieldErrors,
        };
    }
    return { success: true as const, data: result.data };
}

export async function createAccount(
    token: string,
    firstName: string,
    surname: string,
    password: string,
    teamName: string,
) {
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
        return { success: false as const, error: "Invalid or expired invitation" };
    }

    const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.name, teamName));

    if (!team) {
        return { success: false as const, errors: { teamName: ["Team not found"] } };
    }

    const passwordHash = await hash(password, 12);

    try {
        await db.transaction(async (tx) => {
            await tx.insert(users).values({
                firstName,
                surname,
                email: invitation.email,
                passwordHash,
                teamId: team.id,
                role: "member",
            });

            await tx
                .update(invitations)
                .set({ acceptedAt: new Date() })
                .where(eq(invitations.token, token));
        });
    } catch (err: any) {
        if (err?.code === "23505") {
            return {
                success: false as const,
                errors: { email: ["An account with this email already exists"] },
            };
        }
        console.error("createAccount failed:", err);
        return {
            success: false as const,
            error: "Something went wrong creating your account. Please try again.",
        };
    }

    return { success: true as const };
}

