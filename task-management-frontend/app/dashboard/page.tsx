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
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "IN_PROGRESS":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "DONE":
				return "bg-green-100 text-green-800 border-green-200";
		}
	};

	const getStatusLabel = (status: Task["status"]) => {
		return status.replace("_", " ");
	};

	return (
		<div className="min-h-screen bg-[#f6f1e8] text-[#15120f]">
			{/* Header */}
			<header className="border-b border-[#15120f]/10 bg-white/80 backdrop-blur-sm">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">Task Dashboard</h1>
						<button
							onClick={handleLogout}
							className="rounded-lg border border-[#15120f]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#15120f]/5"
						>
							Logout
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Controls */}
				<div className="mb-6 space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0">
					<div className="flex flex-1 gap-4">
						{/* Search */}
						<input
							type="text"
							placeholder="Search tasks..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setPage(1);
							}}
							className="flex-1 rounded-lg border border-[#15120f]/20 bg-white px-4 py-2 text-sm focus:border-[#15120f]/40 focus:outline-none"
						/>

						{/* Filter */}
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setPage(1);
							}}
							className="rounded-lg border border-[#15120f]/20 bg-white px-4 py-2 text-sm focus:border-[#15120f]/40 focus:outline-none"
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
						className="w-full rounded-lg bg-[#15120f] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#15120f]/90 sm:w-auto"
					>
						+ Add Task
					</button>
				</div>

				{/* Tasks List */}
				{loading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#15120f]/20 border-t-[#15120f]"></div>
					</div>
				) : tasks.length === 0 ? (
					<div className="rounded-lg border border-[#15120f]/10 bg-white/80 p-12 text-center">
						<p className="text-[#5f5147]">
							No tasks found. Create your first task to get started!
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{tasks.map((task) => (
							<div
								key={task.id}
								className="rounded-lg border border-[#15120f]/10 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
							>
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div className="flex-1">
										<div className="flex items-start gap-3">
											<button
												onClick={() => handleToggleStatus(task)}
												className={`mt-1 h-5 w-5 flex-shrink-0 rounded border-2 transition ${
													task.status === "DONE"
														? "border-green-500 bg-green-500"
														: "border-[#15120f]/30 hover:border-[#15120f]/50"
												}`}
											>
												{task.status === "DONE" && (
													<svg
														className="h-full w-full text-white"
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
											<div className="flex-1">
												<h3 className="font-semibold">{task.title}</h3>
												{task.description && (
													<p className="mt-1 text-sm text-[#5f5147]">
														{task.description}
													</p>
												)}
												<div className="mt-2 flex items-center gap-2">
													<span
														className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${getStatusColor(
															task.status
														)}`}
													>
														{getStatusLabel(task.status)}
													</span>
													<span className="text-xs text-[#7c6b60]">
														{new Date(task.createdAt).toLocaleDateString()}
													</span>
												</div>
											</div>
										</div>
									</div>

									<div className="flex gap-2 sm:flex-col sm:items-end">
										<button
											onClick={() => handleEditTask(task)}
											className="rounded border border-[#15120f]/20 px-3 py-1 text-sm transition hover:bg-[#15120f]/5"
										>
											Edit
										</button>
										<button
											onClick={() => handleDeleteTask(task.id)}
											className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 transition hover:bg-red-50"
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
					<div className="mt-6 flex items-center justify-center gap-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="rounded-lg border border-[#15120f]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#15120f]/5 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Previous
						</button>

						<span className="px-4 py-2 text-sm font-medium">
							Page {page} of {pagination.totalPages}
						</span>

						<button
							onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
							disabled={page === pagination.totalPages}
							className="rounded-lg border border-[#15120f]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#15120f]/5 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Next
						</button>
					</div>
				)}
			</main>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md rounded-xl border border-[#15120f]/10 bg-white p-6 shadow-2xl">
						<h2 className="mb-4 text-xl font-bold">
							{editingTask ? "Edit Task" : "Add New Task"}
						</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="mb-1 block text-sm font-medium">Title</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									className="w-full rounded-lg border border-[#15120f]/20 px-4 py-2 text-sm focus:border-[#15120f]/40 focus:outline-none"
									required
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium">
									Description
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									className="w-full rounded-lg border border-[#15120f]/20 px-4 py-2 text-sm focus:border-[#15120f]/40 focus:outline-none"
									rows={3}
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium">Status</label>
								<select
									value={formData.status}
									onChange={(e) =>
										setFormData({
											...formData,
											status: e.target.value as Task["status"],
										})
									}
									className="w-full rounded-lg border border-[#15120f]/20 px-4 py-2 text-sm focus:border-[#15120f]/40 focus:outline-none"
								>
									<option value="TODO">To Do</option>
									<option value="IN_PROGRESS">In Progress</option>
									<option value="DONE">Done</option>
								</select>
							</div>

							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="flex-1 rounded-lg border border-[#15120f]/20 py-2 text-sm font-medium transition hover:bg-[#15120f]/5"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 rounded-lg bg-[#15120f] py-2 text-sm font-medium text-white transition hover:bg-[#15120f]/90"
								>
									{editingTask ? "Update" : "Create"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
