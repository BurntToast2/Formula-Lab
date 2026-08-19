"use client";

import { useState } from "react";
import { createInvitation } from "@/app/actions/invitations";

export default function invite(){
    const [email, setEmail] = useState("");

    async function handleInvite(){
        await createInvitation(email);
    }

    return ( 
        <div>
            <input 
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@setu.ie"
            />

            <button onClick={handleInvite}>
                Send Invitation
            </button>
        </div>
    ); 
}
