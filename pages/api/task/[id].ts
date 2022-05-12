import { Task } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUserId } from "../../../auth";
import { prisma } from "../../../db";
import { docker, removeContainer } from "../../../docker";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let userId = await getSessionUserId(req, res);
    if (!userId) return;

    let taskId = parseInt(req.query.id as any);
    if (isNaN(taskId)) {
        return res.status(406).end();
    }

    if (req.method === "GET") {
        let task: Partial<Task> | null = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
            include: {
                owner: {
                    select: {
                        email: true,
                        id: true,
                        userName: true,
                    },
                },
            },
        });

        if (!task) return res.status(404).end();

        if (userId !== task.ownerId) {
            delete task.notebookPort;
            delete task.notebookToken;
            delete task.scriptPath;
            delete task.description;
        }

        return res.json(task);
    } else if (req.method === "DELETE") {
        let task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) return res.status(404).end();

        if (userId !== task.ownerId) return res.status(403).end();

        if (task.containerId) {
            let container = docker.getContainer(task.containerId);
            removeContainer(container)
                .then(() => {
                    console.log("Removed container with id %s because it's task was deleted", container.id);
                })
                .catch((ex) => {
                    console.log("Could not remove container with id %s (because it's task was deleted):", container.id, ex);
                });
        }

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
