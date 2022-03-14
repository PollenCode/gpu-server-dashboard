import { prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        // Set a cookie that expires immediately
        res.setHeader("Set-Cookie", cookie.serialize("gpuserver", "", { maxAge: 0, path: "/", httpOnly: true, sameSite: "strict" }));
        res.redirect("/");
    } else {
        return res.status(405).end();
    }
};
