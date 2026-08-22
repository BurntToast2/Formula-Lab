"use server";

import { db } from "@/db";
import { invitations, teams } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";

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
        return {
            success: false as const,
            error: "Invalid or expired invitation",
        };
    }

    const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.name, teamName));

    if (!team) {
        return {
            success: false as const,
            errors: {
                teamName: ["Team not found"],
            },
        };
    }

    const result = await auth.api.signUpEmail({
        body: {
            name: `${firstName} ${surname}`,
            email: invitation.email,
            password,
            firstName,
            surname,
            teamId: team.id,
            role: "member",
        },
    });

    if (!result) {
        return {
            success: false as const,
            error: "Something went wrong creating your account. Please try again.",
        };
    }

    await db
        .update(invitations)
        .set({
            acceptedAt: new Date(),
        })
        .where(eq(invitations.token, token));

    return {
        success: true as const,
    };
}
