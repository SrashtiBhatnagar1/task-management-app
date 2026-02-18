"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Task {
	id: string;
	title: string;
	description: string | null;
	status: "TODO" | "IN_PROGRESS" | "DONE";
	createdAt: string;
	updatedAt: string;
}

interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export default function DashboardPage() {
	const router = useRouter();
	const [tasks, setTasks] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationMeta>({
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 1,
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		status: "TODO" as Task["status"],
	});

	useEffect(() => {
		fetchTasks();
	}, [page, searchQuery, statusFilter]);

	const fetchTasks = async () => {
		try {
			setLoading(true);
			const params: Record<string, string | number> = {
				page,
				limit: 10,
			};

			if (searchQuery) {
				params.search = searchQuery;
			}

			if (statusFilter !== "all") {
				params.status = statusFilter;
			}

			const response = await api.get("/tasks", { params });
			setTasks(response.data.tasks);
			setPagination({
				total: response.data.total,
				page: response.data.page,
				limit: 10,
				totalPages: response.data.totalPages,
			});
		} catch (error: any) {
			if (error.response?.status === 401) {
				router.push("/login");
			} else {
				toast.error("Failed to fetch tasks");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleAddTask = () => {
		setEditingTask(null);
		setFormData({ title: "", description: "", status: "TODO" });
		setIsModalOpen(true);
	};

	const handleEditTask = (task: Task) => {
		setEditingTask(task);
		setFormData({
			title: task.title,
			description: task.description || "",
			status: task.status,
		});
		setIsModalOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("Title is required");
			return;
		}

		try {
			if (editingTask) {
				await api.put(`/tasks/${editingTask.id}`, formData);
				toast.success("Task updated successfully");
			} else {
				await api.post("/tasks", formData);
				toast.success("Task created successfully");
			}
			setIsModalOpen(false);
			fetchTasks();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to save task");
		}
	};

	const handleDeleteTask = async (id: string) => {
		if (!confirm("Are you sure you want to delete this task?")) {
			return;
		}

		try {
			await api.delete(`/tasks/${id}`);
			toast.success("Task deleted successfully");
			fetchTasks();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete task");
		}
	};

	const handleToggleStatus = async (task: Task) => {
		const nextStatus =
			task.status === "TODO"
				? "IN_PROGRESS"
				: task.status === "IN_PROGRESS"
				? "DONE"
				: "TODO";

		try {
			await api.put(`/tasks/${task.id}`, { status: nextStatus });
			toast.success("Task status updated");
			fetchTasks();
		} catch (error: any) {
			toast.error("Failed to update task status");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		router.push("/login");
		toast.success("Logged out successfully");
	};

	const getStatusColor = (status: Task["status"]) => {
		switch (status) {
			case "TODO":
				return "bg-amber-500/10 text-amber-400 border-amber-500/30";
			case "IN_PROGRESS":
				return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
			case "DONE":
				return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
		}
	};

	const getStatusLabel = (status: Task["status"]) => {
		return status.replace("_", " ");
	};

	// Calculate statistics
	const stats = {
		total: tasks.length,
		todo: tasks.filter(t => t.status === "TODO").length,
		inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
		done: tasks.filter(t => t.status === "DONE").length,
		completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "DONE").length / tasks.length) * 100) : 0
	};

	return (
		<div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
			{/* Subtle background pattern */}
			<div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />
			<div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
			
			{/* Header */}
			<header className="sticky top-0 z-40 border-b border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-xl">
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-lg shadow-[#f59e0b]/20">
								<svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div>
								<h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Mini Notion</h1>
								<p className="text-xs text-gray-500">Task Management</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className="group rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium transition hover:border-red-500/50 hover:bg-red-950/20 hover:text-red-400"
						>
							<span className="flex items-center gap-2">
								<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								Logout
							</span>
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Stats Cards */}
				{!loading && tasks.length > 0 && (
					<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
						<div className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 transition hover:border-[#f59e0b]/30">
							<div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[#f59e0b]/10 blur-2xl transition group-hover:bg-[#f59e0b]/20" />
							<div className="relative">
								<p className="text-sm font-medium text-gray-400">Total Tasks</p>
								<p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
							</div>
						</div>
						<div className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 transition hover:border-amber-500/30">
							<div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20" />
							<div className="relative">
								<p className="text-sm font-medium text-gray-400">To Do</p>
								<p className="mt-2 text-3xl font-bold text-amber-400">{stats.todo}</p>
							</div>
						</div>
						<div className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 transition hover:border-cyan-500/30">
							<div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-500/20" />
							<div className="relative">
								<p className="text-sm font-medium text-gray-400">In Progress</p>
								<p className="mt-2 text-3xl font-bold text-cyan-400">{stats.inProgress}</p>
							</div>
						</div>
						<div className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 transition hover:border-emerald-500/30">
							<div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20" />
							<div className="relative">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-gray-400">Completed</p>
									<span className="text-xs font-semibold text-emerald-400">{stats.completionRate}%</span>
								</div>
								<p className="mt-2 text-3xl font-bold text-emerald-400">{stats.done}</p>
							</div>
						</div>
					</div>
				)}

				{/* Controls */}
				<div className="mb-8 space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0">
					<div className="flex flex-1 gap-3">
						{/* Search */}
						<div className="relative flex-1">
							<svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search tasks..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setPage(1);
								}}
								className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-[#e5e5e5] placeholder:text-gray-500 focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b]"
							/>
						</div>

						{/* Filter */}
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setPage(1);
							}}
							className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5 text-sm text-[#e5e5e5] focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b]"
						>
							<option value="all">All Status</option>
							<option value="TODO">To Do</option>
							<option value="IN_PROGRESS">In Progress</option>
							<option value="DONE">Done</option>
						</select>
					</div>

					{/* Add Task Button */}
					<button
						onClick={handleAddTask}
						className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#f59e0b]/25 transition hover:shadow-xl hover:shadow-[#f59e0b]/40 sm:w-auto"
					>
						<span className="relative z-10 flex items-center justify-center gap-2">
							<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							Add Task
						</span>
						<div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
					</button>
				</div>

				{/* Tasks List */}
				{loading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="relative">
							<div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f59e0b]/20 border-t-[#f59e0b]"></div>
							<div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-[#f59e0b]/20"></div>
						</div>
					</div>
				) : tasks.length === 0 ? (
					<div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-16 text-center">
						<div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent" />
						<div className="relative">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b]/20 to-[#d97706]/10 animate-float">
								<svg className="h-10 w-10 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
								</svg>
							</div>
							<h3 className="mb-2 text-xl font-semibold text-white">
								No tasks yet
							</h3>
							<p className="mb-6 text-gray-400">
								Create your first task to get started on your journey
							</p>
							<button
								onClick={handleAddTask}
								className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f59e0b]/25 transition hover:shadow-xl hover:shadow-[#f59e0b]/40"
							>
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								Create First Task
							</button>
						</div>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{tasks.map((task, index) => (
							<div
								key={task.id}
								style={{ animationDelay: `${index * 50}ms` }}
								className="group relative flex flex-col rounded-xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-[#f59e0b]/30 hover:shadow-2xl hover:shadow-[#f59e0b]/10 animate-fadeIn"
							>
								{/* Shine effect on hover */}
								<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
								
								{/* Status Badge */}
								<div className="relative mb-4 flex items-center justify-between">
									<span
										className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm ${getStatusColor(
											task.status
										)}`}
									>
										<span className={`h-1.5 w-1.5 rounded-full ${
											task.status === "TODO" ? "bg-amber-400" :
											task.status === "IN_PROGRESS" ? "bg-cyan-400 animate-pulse" :
											"bg-emerald-400"
										}`} />
										{getStatusLabel(task.status)}
									</span>
									<button
										onClick={() => handleToggleStatus(task)}
										className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all ${
											task.status === "DONE"
												? "border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/50"
												: "border-gray-600 hover:border-[#f59e0b] hover:bg-[#f59e0b]/10"
										}`}
									>
										{task.status === "DONE" && (
											<svg
												className="h-4 w-4 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={3}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
									</button>
								</div>

								{/* Task Content */}
								<div className="relative mb-4 flex-1">
									<h3 className="mb-3 text-lg font-semibold text-white line-clamp-2 group-hover:text-[#f59e0b] transition-colors">
										{task.title}
									</h3>
									{task.description && (
										<p className="text-sm leading-relaxed text-gray-400 line-clamp-3">
											{task.description}
										</p>
									)}
								</div>

								{/* Footer */}
								<div className="relative flex items-center justify-between border-t border-[#2a2a2a] pt-4">
									<div className="flex items-center gap-1.5 text-xs text-gray-500">
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										{new Date(task.createdAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => handleEditTask(task)}
											className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium transition hover:border-[#f59e0b] hover:bg-[#f59e0b]/10 hover:text-[#f59e0b]"
										>
											Edit
										</button>
										<button
											onClick={() => handleDeleteTask(task.id)}
											className="rounded-lg border border-red-900/30 bg-red-950/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-800 hover:bg-red-900/50"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{pagination.totalPages > 1 && (
					<div className="mt-8 flex items-center justify-center gap-3">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium transition hover:border-[#f59e0b] hover:bg-[#f59e0b]/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#2a2a2a] disabled:hover:bg-[#1a1a1a]"
						>
							<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Previous
						</button>

						<div className="flex items-center gap-2">
							{[...Array(pagination.totalPages)].map((_, i) => {
								const pageNum = i + 1;
								if (
									pageNum === 1 ||
									pageNum === pagination.totalPages ||
									(pageNum >= page - 1 && pageNum <= page + 1)
								) {
									return (
										<button
											key={pageNum}
											onClick={() => setPage(pageNum)}
											className={`h-10 w-10 rounded-lg text-sm font-medium transition ${
												page === pageNum
													? "bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-lg shadow-[#f59e0b]/25"
													: "border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#f59e0b] hover:bg-[#f59e0b]/10"
											}`}
										>
											{pageNum}
										</button>
									);
								} else if (pageNum === page - 2 || pageNum === page + 2) {
									return <span key={pageNum} className="px-2 text-gray-600">...</span>;
								}
								return null;
							})}
						</div>

						<button
							onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
							disabled={page === pagination.totalPages}
							className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium transition hover:border-[#f59e0b] hover:bg-[#f59e0b]/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#2a2a2a] disabled:hover:bg-[#1a1a1a]"
						>
							Next
							<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				)}
			</main>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
					<div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 shadow-2xl animate-fadeIn">
						{/* Decorative elements */}
						<div className="absolute right-0 top-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-[#f59e0b]/20 blur-3xl" />
						<div className="absolute left-0 bottom-0 h-32 w-32 -translate-x-16 translate-y-16 rounded-full bg-[#f59e0b]/10 blur-3xl" />
						
						<div className="relative">
							<div className="mb-6 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706]">
									<svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</div>
								<h2 className="text-2xl font-bold text-white">
									{editingTask ? "Edit Task" : "Create New Task"}
								</h2>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label className="mb-2 block text-sm font-medium text-gray-300">Title</label>
									<input
										type="text"
										value={formData.title}
										onChange={(e) =>
											setFormData({ ...formData, title: e.target.value })
										}
										className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 transition"
										placeholder="Enter task title"
										required
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-gray-300">
										Description
									</label>
									<textarea
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 transition resize-none"
										rows={4}
										placeholder="Add a description (optional)"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
									<select
										value={formData.status}
										onChange={(e) =>
											setFormData({
												...formData,
												status: e.target.value as Task["status"],
											})
										}
										className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 transition"
									>
										<option value="TODO">To Do</option>
										<option value="IN_PROGRESS">In Progress</option>
										<option value="DONE">Done</option>
									</select>
								</div>

								<div className="flex gap-3 pt-2">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] py-3 text-sm font-medium transition hover:bg-[#252525] hover:border-[#3a3a3a]"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] py-3 text-sm font-semibold text-white shadow-lg shadow-[#f59e0b]/25 transition hover:shadow-xl hover:shadow-[#f59e0b]/40"
									>
										<span className="relative z-10">{editingTask ? "Update Task" : "Create Task"}</span>
										<div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
