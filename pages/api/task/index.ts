import { Task } from ".prisma/client";
import next, { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser, getSessionUserId } from "../../../auth";
import { getSetting, prisma, SETTING_GPU_COUNT } from "../../../db";
import { createJupyterContainer, docker, getRandomPort, removeContainer } from "../../../docker";
import { IS_DEV } from "../../../util";
import crypto from "crypto";
import { findScheduleSpot } from "../../../db";
import { isSpotTaken } from "../../../scheduler";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let userId = await getSessionUserId(req, res);
    if (!userId) {
        return res.status(401).end();
    }

    if (req.method === "GET") {
        let from;
        if (req.query.from) {
            from = new Date(String(req.query.from));
            if (isNaN(from.getTime())) {
                return res.status(406).end();
            }
        } else {
            from = new Date();
        }

        let to;
        if (req.query.to) {
            to = new Date(String(req.query.to));
            if (isNaN(to.getTime())) {
                return res.status(406).end();
            }
        } else {
            to = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7);
        }

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
                owner: {
                    select: {
                        id: true,
                        userName: true,
                        email: true,
                    },
                },
            },
        });

        res.json(tasks);
    } else if (req.method === "POST") {
        let data = req.body;

        let allGpus = !!data.allGpus;
        let name = data.name;
        let description = data.description;
        let trainMilliseconds = 1000 * 60 * data.trainMinutes;

        let date = new Date(data.date);
        if (isNaN(date.getTime())) {
            return res.status(406).end();
        }

        let nextTasks = await prisma.task.findMany({
            where: {
                endDate: {
                    gte: new Date(),
                },
            },
            orderBy: {
                startDate: "asc",
            },
        });

        let gpuCount = await getSetting<number>(SETTING_GPU_COUNT);
        let scheduledGpus: number[] = [];
        if (allGpus) {
            if (!isSpotTaken(nextTasks, trainMilliseconds, date)) {
                scheduledGpus = new Array(gpuCount).fill(0).map((_, i) => i);
            }
        } else {
            for (let g = 0; g < gpuCount; g++) {
                let takenOnGpu = isSpotTaken(
                    nextTasks.filter((e) => e.gpus.includes(g)),
                    trainMilliseconds,
                    date
                );

                if (!takenOnGpu) {
                    scheduledGpus = [g];
                    break;
                }
            }
        }

        if (scheduledGpus.length === 0) {
            console.log("User tried to schedule spot already taken");
            return res.status(400).end();
        }

        let notebookToken = crypto.randomBytes(64).toString("hex");
        let notebookPort = getRandomPort();
        let container;
        try {
            container = await createJupyterContainer(notebookPort, notebookToken);
        } catch (ex) {
            console.error("Could not create Docker container for new task:", ex);
            return res.status(400).json({
                message: "Could not create Docker container",
            });
        }

        let task = await prisma.task.create({
            data: {
                name: name,
                owner: {
                    connect: {
                        id: userId,
                    },
                },
                containerId: container.id,
                startDate: date,
                endDate: new Date(date.getTime() + trainMilliseconds),
                description: description,
                gpus: scheduledGpus,
                notebookToken: notebookToken,
                notebookPort: notebookPort,
            },
        });

        res.json(task);
    } else {
        return res.status(405).end();
    }
};

async function refreshCurrentTasks() {
    let now = new Date();

    try {
        // Check which containers to stop
        let containers = await docker.listContainers({ all: true });
        let containerTasks = await prisma.task.findMany({
            where: {
                containerId: {
                    in: containers.map((e) => e.Id),
                },
            },
        });

        for (let i = 0; i < containers.length; i++) {
            let containerInfo = containers[i];
            let container = docker.getContainer(containerInfo.Id);
            let task = containerTasks.find((e) => e.containerId === containerInfo.Id);
            if (!task || !task.startDate || !task.endDate) {
                if (containerInfo.Labels["Type"] === "task") {
                    // Delete container because its task does not exist anymore in the database
                    removeContainer(container)
                        .then(() => {
                            console.log("Removed container with id %s because it wasn't connected to a task anymore", container.id);
                        })
                        .catch((ex) => {
                            console.log("Could not remove container with id %s (it wasn't connected to a task anymore):", container.id, ex);
                        });
                }
                continue;
            }

            let shouldBeRunning = task.startDate.getTime() <= now.getTime() && task.endDate.getTime() > now.getTime();
            if (shouldBeRunning) {
                if (containerInfo.State !== "running") {
                    container
                        .start()
                        .then(() => {
                            console.log("Scheduler started Docker container %s for task id %d", container.id, task!.id);
                        })
                        .catch((ex) => {
                            console.error("Scheduler could not start Docker container %s for task id %d:", container.id, task!.id, ex);
                        });
                }
            } else {
                if (containerInfo.State === "running") {
                    container
                        .stop()
                        .then(() => {
                            console.log("Scheduler stopped Docker container %s for task id %d", container.id, task!.id);
                        })
                        .catch((ex) => {
                            console.error("Scheduler could not stop Docker container %s for task id %d:", container.id, task!.id, ex);
                        });
                }
            }
        }
    } finally {
        setTimeout(refreshCurrentTasks, 10000);
    }
}

setTimeout(refreshCurrentTasks, 10000);
