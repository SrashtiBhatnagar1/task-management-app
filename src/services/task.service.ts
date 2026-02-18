import { Task, TaskStatus } from "@prisma/client";

import prisma from "../utils/prisma";
import { badRequest, forbidden, notFound } from "../utils/errors";

export interface ListTasksParams {
	page: number;
	limit: number;
	status?: TaskStatus;
	search?: string;
}

export interface TaskListResult {
	tasks: Task[];
	total: number;
	page: number;
	totalPages: number;
}

export interface CreateTaskInput {
	title: string;
	description?: string;
	status?: TaskStatus;
}

export interface UpdateTaskInput {
	title?: string;
	description?: string;
	status?: TaskStatus;
}

const getTaskOrThrow = async (userId: string, taskId: string): Promise<Task> => {
	const task = await prisma.task.findUnique({ where: { id: taskId } });
	if (!task) {
		throw notFound("Task not found");
	}
	if (task.userId !== userId) {
		throw forbidden("Access to task denied");
	}
	return task;
};

export const listTasks = async (userId: string, params: ListTasksParams): Promise<TaskListResult> => {
	const where = {
		userId,
		...(params.status ? { status: params.status } : {}),
		...(params.search
			? { title: { contains: params.search, mode: "insensitive" as const } }
			: {}),
	};

	const [tasks, total] = await Promise.all([
		prisma.task.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (params.page - 1) * params.limit,
			take: params.limit,
		}),
		prisma.task.count({ where }),
	]);

	return {
		tasks,
		total,
		page: params.page,
		totalPages: Math.max(1, Math.ceil(total / params.limit)),
	};
};

export const getTaskById = async (userId: string, taskId: string): Promise<Task> =>
	getTaskOrThrow(userId, taskId);

export const createTask = async (userId: string, input: CreateTaskInput): Promise<Task> => {
	return prisma.task.create({
		data: {
			title: input.title,
			description: input.description,
			status: input.status ?? TaskStatus.TODO,
			userId,
		},
	});
};

export const updateTask = async (
	userId: string,
	taskId: string,
	input: UpdateTaskInput
): Promise<Task> => {
	if (!input.title && !input.description && !input.status) {
		throw badRequest("No valid fields provided for update");
	}

	await getTaskOrThrow(userId, taskId);

	return prisma.task.update({
		where: { id: taskId },
		data: {
			title: input.title,
			description: input.description,
			status: input.status,
		},
	});
};

export const toggleTaskStatus = async (userId: string, taskId: string): Promise<Task> => {
	const task = await getTaskOrThrow(userId, taskId);
	const nextStatus = 
		task.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS :
		task.status === TaskStatus.IN_PROGRESS ? TaskStatus.DONE :
		TaskStatus.TODO;

	return prisma.task.update({
		where: { id: taskId },
		data: { status: nextStatus },
	});
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
	await getTaskOrThrow(userId, taskId);
	await prisma.task.delete({ where: { id: taskId } });
};
