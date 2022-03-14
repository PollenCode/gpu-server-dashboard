import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        let cookie = req.cookies["gpuserver"];
        if (!cookie) {
            return res.status(401).end();
        }

        let userId;
        try {
            userId = (jwt.verify(cookie, process.env.COOKIE_SECRET!) as any)?.userId;
        } catch (ex) {
            console.error("Could not verify jwt token", ex);
            return res.status(400).end();
        }

        let user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return res.status(404).end();
        }

        res.json(user);
    } else {
        return res.status(405).end();
    }
};
