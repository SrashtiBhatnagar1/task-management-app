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
	const [showPassword, setShowPassword] = useState(false);
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
		<div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-[#e5e5e5]">
			<div className="pointer-events-none absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[#f59e0b]/20 blur-3xl" />
			<div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-[#d97706]/15 blur-3xl" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.1),transparent_55%)]" />

			<div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row">
				<section className="flex max-w-xl flex-col gap-6">
					<p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-500">
						Mini Notion
					</p>
					<h1 className="text-4xl font-semibold leading-tight md:text-5xl">
						Welcome back.
						<span className="block bg-gradient-to-r from-[#f59e0b] to-[#d97706] bg-clip-text text-transparent">Your focus is saved.</span>
					</h1>
					<p className="text-base leading-7 text-gray-400">
						Sign in to pick up your tasks, review priorities, and stay in rhythm.
					</p>
					<div className="flex items-center gap-3 text-sm text-gray-400">
						<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white font-semibold shadow-lg shadow-[#f59e0b]/25">
							01
						</span>
						Refresh, review, and keep momentum.
					</div>
				</section>

				<section className="w-full max-w-md rounded-3xl border border-[#2a2a2a] bg-[#1a1a1a]/80 p-8 shadow-[0_30px_80px_-50px_rgba(245,158,11,0.3)] backdrop-blur">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold text-white">Sign in</h2>
						<p className="text-sm text-gray-400">Use your email and password.</p>
					</div>

					<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-300">Email</label>
							<input
								type="email"
								name="email"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
								placeholder="you@company.com"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-300">Password</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									required
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									className="w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-500 focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
									placeholder="Enter your password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
											<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
											<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
											<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
									)}
								</button>
							</div>
						</div>

						{error ? (
							<p className="rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400" role="alert">
								{error}
							</p>
						) : null}

						<button
							type="submit"
							disabled={isLoading}
							className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-4 py-3 text-sm font-semibold text-white transition hover:shadow-xl hover:shadow-[#f59e0b]/30 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-[#f59e0b]/20"
						>
							{isLoading ? "Signing in..." : "Sign in"}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-gray-400">
						New here?{" "}
						<Link href="/register" className="font-semibold text-[#f59e0b] hover:text-[#d97706]">
							Create an account
						</Link>
					</p>
				</section>
			</div>
		</div>
	);
}
