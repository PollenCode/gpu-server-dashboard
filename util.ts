export const IS_DEV = process.env.NODE_ENV === "development";

export const GPU_COUNT = parseInt(process.env.GPU_COUNT!);

export const SERVER_URL = IS_DEV ? "http://localhost:3000" : "https://www.test.gpuserver.test";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());
