import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
// Queue to store failed requests while token is being refreshed
let failedRequestsQueue: Array<(token: string) => void> = [];

// Request interceptor to add access token to requests
api.interceptors.request.use(
	(config) => {
		const accessToken = localStorage.getItem("accessToken");
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle 401 errors and refresh token
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Don't refresh token for auth endpoints (login/register)
		const isAuthEndpoint = originalRequest.url?.includes('/auth/');
		
		// Check if error is 401 and we haven't retried yet (but not for auth endpoints)
		if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
			// Prevent infinite loop by marking this request as retried
			originalRequest._retry = true;

			if (!isRefreshing) {
				isRefreshing = true;

				try {
					// Call refresh endpoint
					const refreshToken = localStorage.getItem("refreshToken");
					
					if (!refreshToken) {
						throw new Error("No refresh token available");
					}

					const response = await axios.post(
						`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api"}/auth/refresh`,
						{ refreshToken }
					);

					const { accessToken: newAccessToken } = response.data;

					// Update access token in localStorage
					localStorage.setItem("accessToken", newAccessToken);

					// Process queued requests with new token
					failedRequestsQueue.forEach((callback) => callback(newAccessToken));
					failedRequestsQueue = [];

					// Update original request with new token
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

					isRefreshing = false;

					// Retry original request
					return api(originalRequest);
				} catch (refreshError) {
					// Refresh token failed - logout user
					isRefreshing = false;
					failedRequestsQueue = [];

					// Clear tokens
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");

					// Redirect to login page
					if (typeof window !== "undefined") {
						window.location.href = "/login";
					}

					return Promise.reject(refreshError);
				}
			}

			// If already refreshing, queue this request
			return new Promise((resolve, reject) => {
				failedRequestsQueue.push((token: string) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					resolve(api(originalRequest));
				});
			});
		}

		return Promise.reject(error);
	}
);

export default api;
