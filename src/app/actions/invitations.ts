"use server";

import { db } from "@/db";
import { invitations } from "@/db/schema";

import { z } from "zod";
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
