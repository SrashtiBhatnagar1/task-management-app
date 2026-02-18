import { Router } from "express";
import { TaskStatus } from "@prisma/client";

import { create, getById, list, remove, toggle, update } from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody, Validator } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

interface CreateTaskBody {
	title: string;
	description?: string;
	status?: TaskStatus;
}

interface UpdateTaskBody {
	title?: string;
	description?: string;
	status?: TaskStatus;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";

const normalizeStatus = (value: unknown): TaskStatus | undefined => {
	if (value === undefined) {
		return undefined;
	}
	if (!isString(value)) {
		return undefined;
	}
	const normalized = value.trim().toUpperCase();
	if (normalized === "TODO" || normalized === "IN_PROGRESS" || normalized === "DONE") {
		return normalized as TaskStatus;
	}
	return undefined;
};

const createValidator: Validator<CreateTaskBody> = (input) => {
	if (!isRecord(input)) {
		return { success: false, errors: ["Body must be an object"] };
	}

	const record = input as Record<string, unknown>;
	const errors: string[] = [];

	const rawTitle = record.title;
	const title = isString(rawTitle) ? rawTitle.trim() : "";
	if (title.length === 0) {
		errors.push("Title is required");
	}

	const rawDescription = record.description;
	if (rawDescription !== undefined && !isString(rawDescription)) {
		errors.push("Description must be a string");
	}

	const status = normalizeStatus(record.status);
	if (record.status !== undefined && !status) {
		errors.push("Status must be TODO, IN_PROGRESS, or DONE");
	}

	if (errors.length > 0) {
		return { success: false, errors };
	}

	return {
		success: true,
		data: {
			title,
			description: isString(rawDescription) ? rawDescription.trim() : undefined,
			status,
		},
	};
};

const updateValidator: Validator<UpdateTaskBody> = (input) => {
	if (!isRecord(input)) {
		return { success: false, errors: ["Body must be an object"] };
	}

	const errors: string[] = [];
	const data: UpdateTaskBody = {};

	if (input.title !== undefined) {
		if (!isString(input.title) || input.title.trim().length === 0) {
			errors.push("Title must be a non-empty string");
		} else {
			data.title = input.title.trim();
		}
	}

	if (input.description !== undefined) {
		if (!isString(input.description)) {
			errors.push("Description must be a string");
		} else {
			data.description = input.description.trim();
		}
	}

	if (input.status !== undefined) {
		const status = normalizeStatus(input.status);
		if (!status) {
			errors.push("Status must be TODO, IN_PROGRESS, or DONE");
		} else {
			data.status = status;
		}
	}

	if (Object.keys(data).length === 0) {
		errors.push("At least one field must be provided");
	}

	if (errors.length > 0) {
		return { success: false, errors };
	}

	return { success: true, data };
};

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(list));
router.post("/", validateBody(createValidator), asyncHandler(create));
router.get("/:id", asyncHandler(getById));
router.put("/:id", validateBody(updateValidator), asyncHandler(update));
router.delete("/:id", asyncHandler(remove));
router.put("/:id/toggle", asyncHandler(toggle));

export default router;
