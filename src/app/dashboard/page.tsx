import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        return (
            <main>
                <h1>User not found</h1>
                <p>Your authentication session exists, but your user account could not be found.</p>
            </main>
        );
    }

    return (
        <main>
            <h1>Dashboard</h1>

            <p>
                Welcome, {user.firstName} {user.surname}
            </p>

            <p>
                Email: {user.email}
            </p>

            <p>
                Team ID: {user.teamId}
            </p>

            <p>
                Role: {user.role}
            </p>
        </main>
    );
}
