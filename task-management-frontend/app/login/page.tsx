"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

import api from "@/lib/api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message;
		if (typeof message === "string" && message.trim().length > 0) {
			return message;
		}
	}
	return "Unable to sign in. Please check your details and try again.";
};

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await api.post("/auth/login", {
				email,
				password,
			});
			const tokens = response.data?.tokens as
				| { accessToken: string; refreshToken: string }
				| undefined;

			if (!tokens?.accessToken || !tokens?.refreshToken) {
				throw new Error("Missing auth tokens");
			}

			localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
			localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
			router.push("/dashboard");
		} catch (submitError) {
			setError(getErrorMessage(submitError));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-[#15120f]">
			<div className="pointer-events-none absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[#ffbd70]/50 blur-3xl" />
			<div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-[#78d2c8]/45 blur-3xl" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff80,transparent_55%)]" />

			<div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row">
				<section className="flex max-w-xl flex-col gap-6">
					<p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#7c6b60]">
						Mini Notion
					</p>
					<h1 className="text-4xl font-semibold leading-tight md:text-5xl">
						Welcome back.
						<span className="block text-[#b2623c]">Your focus is saved.</span>
					</h1>
					<p className="text-base leading-7 text-[#5f5147]">
						Sign in to pick up your tasks, review priorities, and stay in rhythm.
					</p>
					<div className="flex items-center gap-3 text-sm text-[#5f5147]">
						<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#15120f] text-white">
							01
						</span>
						Refresh, review, and keep momentum.
					</div>
				</section>

				<section className="w-full max-w-md rounded-3xl border border-[#15120f]/10 bg-white/80 p-8 shadow-[0_30px_80px_-50px_rgba(21,18,15,0.6)] backdrop-blur">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold">Sign in</h2>
						<p className="text-sm text-[#6a5b50]">Use your email and password.</p>
					</div>

					<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<label className="text-sm font-medium">Email</label>
							<input
								type="email"
								name="email"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="w-full rounded-2xl border border-[#15120f]/15 bg-white px-4 py-3 text-sm focus:border-[#b2623c] focus:outline-none focus:ring-2 focus:ring-[#b2623c]/20"
								placeholder="you@company.com"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Password</label>
							<input
								type="password"
								name="password"
								required
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="w-full rounded-2xl border border-[#15120f]/15 bg-white px-4 py-3 text-sm focus:border-[#b2623c] focus:outline-none focus:ring-2 focus:ring-[#b2623c]/20"
								placeholder="Enter your password"
							/>
						</div>

						{error ? (
							<p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
								{error}
							</p>
						) : null}

						<button
							type="submit"
							disabled={isLoading}
							className="flex w-full items-center justify-center rounded-2xl bg-[#15120f] px-4 py-3 text-sm font-semibold text-[#fef8ef] transition hover:bg-[#2c241d] disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isLoading ? "Signing in..." : "Sign in"}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-[#6a5b50]">
						New here?{" "}
						<Link href="/register" className="font-semibold text-[#b2623c]">
							Create an account
						</Link>
					</p>
				</section>
			</div>
		</div>
	);
}
