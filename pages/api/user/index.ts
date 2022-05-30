import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db";
import { getSessionUser } from "../../../auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        let user = await getSessionUser(req, res);
        if (!user) {
            return res.status(401).end();
        }
        res.json(user);
    } else {
        return res.status(405).end();
    }
};
