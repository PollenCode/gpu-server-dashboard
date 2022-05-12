import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUserId } from "../../../../auth";
import { prisma } from "../../../../db";
import { docker } from "../../../../docker";

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

        if (!task) {
            return res.status(404).end();
        }

        if (task.ownerId !== userId) {
            return res.status(403).end();
        }

        if (!task.containerId) {
            return res.status(400).end();
        }

        let container = docker.getContainer(task.containerId);
        let logsStream = (await container.logs({ stdout: true, stderr: true })) as unknown as Buffer;
        res.write(logsStream.toString("utf-8"));
        res.end();
    } else {
        return res.status(405).end();
    }
};
