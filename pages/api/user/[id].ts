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

    let id = parseInt(req.query.id as string);
    if (isNaN(id)) {
        return res.status(406).end();
    }

    if (req.method === "GET") {
        let user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });

        if (user) {
            return res.status(404).end();
        }

        res.json(user);
    } else if (req.method === "PATCH") {
        let newRole = req.body.role;

        let newUser = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                role: newRole,
            },
        });

        res.json(newUser);
    } else if (req.method === "DELETE") {
        await prisma.task.deleteMany({
            where: {
                ownerId: id,
            },
        });

        await prisma.user.delete({
            where: {
                id: id,
            },
        });

        res.end();
    } else {
        return res.status(405).end();
    }
};
