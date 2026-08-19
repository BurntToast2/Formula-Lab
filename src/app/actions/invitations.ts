"use server";

import { db } from "@/db";
import { invitations } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";

import { number, z } from "zod";
import { randomBytes } from "crypto";

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
