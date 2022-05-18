export const IS_DEV = process.env.NODE_ENV === "development";

export const GPU_COUNT = parseInt(process.env.GPU_COUNT!);

export const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());
