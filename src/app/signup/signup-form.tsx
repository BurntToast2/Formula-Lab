"use client";
import { useState } from "react";
import Image from "next/image";
import "./signup-form.css";

export default function SignUpForm() {
    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="signup-wrapper">
        <form className="form">
            <div className="accent-bar" />
            <div className="brand">
                <Image src="/setu-logo.png" alt="SETU" width={32} height={32}
                className="brand-mark" />
                <span className="eyebrow">SETU Formula Student</span>
            </div>
            <h1 className="title">Create your account</h1>

            <div className="field-row">
                <div className="field">
                    <label className="label" htmlFor="firstName">First name</label>
                    <input className="input" id="firstName" type="text" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="field">
                    <label className="label" htmlFor="surname">Surname</label>
                    <input className="input" id="surname" type="text" value={surname}
                    onChange={(e) => setSurname(e.target.value)} />
                </div>
            </div>

            <div className="field">
                <label className="label" htmlFor="email">Email</label>
                <input className="input" id="email" type="email"
                 />
            </div>

            <div className="field">
                <label className="label" htmlFor="password">Password</label>
                <input className="input" id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className="button" type="submit">Create account</button>
        </form>
        </div>
    );
}
