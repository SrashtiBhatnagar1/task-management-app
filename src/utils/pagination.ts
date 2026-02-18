import { badRequest } from "./errors";

export interface PaginationResult {
	page: number;
	limit: number;
	skip: number;
	take: number;
}

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
	if (!value) {
		return fallback;
	}
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw badRequest("Pagination values must be positive integers");
	}
	return parsed;
};

export const getPagination = (pageRaw?: string, limitRaw?: string): PaginationResult => {
	const page = parsePositiveInt(pageRaw, 1);
	const limit = parsePositiveInt(limitRaw, 10);
	const maxLimit = 100;

	if (limit > maxLimit) {
		throw badRequest(`Limit cannot exceed ${maxLimit}`);
	}

	return {
		page,
		limit,
		skip: (page - 1) * limit,
		take: limit,
	};
};
