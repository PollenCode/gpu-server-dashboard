import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUserId } from "../../../auth";
import { prisma } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let userId = await getSessionUserId(req, res);
    if (!userId) return;

    let taskId = parseInt(req.query.id as any);
    if (isNaN(taskId)) {
        return res.status(406).end();
    }

    if (req.method === "GET") {
        let task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) return res.status(404).end();

        return res.json(task);
    } else if (req.method === "DELETE") {
        let task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) return res.status(404).end();

        if (userId !== task.ownerId) return res.status(403).end();

        await prisma.task.delete({
            where: {
                id: task.id,
            },
        });

        return res.end();
    } else {
        return res.status(405).end();
    }
};
