export const IS_DEV = process.env.NODE_ENV === "development";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());
