import { Task } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser, getSessionUserId } from "../../../auth";
import { prisma } from "../../../db";
import { docker, removeContainer } from "../../../docker";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let user = await getSessionUser(req, res);
    if (!user) {
        return res.status(401).end();
    }

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

        if (!task) {
            return res.status(404).end();
        }

        if (user.id !== task.ownerId && user.role === "User") {
            delete task.notebookPort;
            delete task.notebookToken;
            delete task.scriptPath;
            delete task.description;
        }

        return res.json(task);
    } else if (req.method === "PATCH") {
        let data = req.body;
        let task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) {
            return res.status(404).end();
        }

        if (user.id !== task.ownerId && user.role === "User") {
            return res.status(403).end();
        }

        let newTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                approvalStatus: user.role !== "User" && data.approvalStatus ? data.approvalStatus : undefined,
            },
        });

        res.json(newTask);
    } else if (req.method === "DELETE") {
        let task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) {
            return res.status(404).end();
        }

        if (user.id !== task.ownerId && user.role === "User") {
            return res.status(403).end();
        }

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
