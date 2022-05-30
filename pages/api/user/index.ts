import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db";
import { getSessionUser } from "../../../auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let user = await getSessionUser(req, res);

    if (!user) {
        return res.status(401).end();
    }

    if (user.role !== "Administrator") {
        return res.status(403).end();
    }

    if (req.method === "GET") {
        let users = await prisma.user.findMany({
            orderBy: [{ role: "asc" }, { userName: "asc" }],
        });

        res.json(users);
    } else {
        return res.status(405).end();
    }
};
