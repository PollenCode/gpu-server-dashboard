import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser, getSessionUserId } from "../../../auth";
import { prisma } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let userId = await getSessionUserId(req, res);
    if (!userId) return;

    if (req.method === "GET") {
        let from = new Date();
        let to = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7);

        let tasks = await prisma.task.findMany({
            where: {
                endDate: {
                    gte: from,
                    lt: to,
                },
            },
            orderBy: {
                startDate: "asc",
            },
            select: {
                description: true,
                endDate: true,
                startDate: true,
                name: true,
                gpus: true,
                id: true,
            },
        });

        res.json(tasks);
    } else if (req.method === "POST") {
        let data = req.body;

        let task = await prisma.task.create({
            data: {
                name: data.name,
                owner: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });

        res.json(task);
    } else {
        return res.status(405).end();
    }
};
