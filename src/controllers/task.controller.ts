import { Request, Response } from "express";
import { TaskStatus } from "@prisma/client";

import {
	createTask,
	deleteTask,
	getTaskById,
	listTasks,
	toggleTaskStatus,
	updateTask,
} from "../services/task.service";
import { badRequest, unauthorized } from "../utils/errors";
import { getPagination } from "../utils/pagination";
import { sendSuccess } from "../utils/response";

const requireUserId = (req: Request): string => {
	if (!req.userId) {
		throw unauthorized("Missing user context");
	}
	return req.userId;
};

const parseStatus = (value: string | undefined): TaskStatus | undefined => {
	if (!value) {
		return undefined;
	}
	const normalized = value.trim().toUpperCase();
	if (normalized === "TODO" || normalized === "IN_PROGRESS" || normalized === "DONE") {
		return normalized as TaskStatus;
	}
	throw badRequest("Invalid status value");
};

export const list = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	const { page, limit } = getPagination(
		typeof req.query.page === "string" ? req.query.page : undefined,
		typeof req.query.limit === "string" ? req.query.limit : undefined
	);

	const status = parseStatus(typeof req.query.status === "string" ? req.query.status : undefined);
	const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

	const result = await listTasks(userId, { page, limit, status, search });
	sendSuccess(res, 200, result);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	const task = await getTaskById(userId, req.params.id);
	sendSuccess(res, 200, task);
};

export const create = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	const task = await createTask(userId, req.body);
	sendSuccess(res, 201, task);
};

export const update = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	const task = await updateTask(userId, req.params.id, req.body);
	sendSuccess(res, 200, task);
};

export const toggle = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	const task = await toggleTaskStatus(userId, req.params.id);
	sendSuccess(res, 200, task);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	await deleteTask(userId, req.params.id);
	res.status(204).send();
};
