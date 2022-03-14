export const IS_DEV = process.env.NODE_ENV === "development";

export const SERVER_URL = IS_DEV ? "https://localhost:5001" : "https://testgpu2.ikdoeict.net";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());