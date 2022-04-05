import { Task } from ".prisma/client";
import next, { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser, getSessionUserId } from "../../../auth";
import { prisma } from "../../../db";
import { GPU_COUNT } from "../../../util";

function findScheduleSpot(tasks: Task[], trainMilliseconds: number): Date {
    if (tasks.length <= 0) {
        // Schedule in 15 minutes
        let date = new Date(new Date().getTime() + 1000 * 60 * 15);
        date.setMilliseconds(0);
        date.setSeconds(0);
        // Align to next 15 minutes
        date.setMinutes((Math.floor(date.getMinutes() / 15) + 1) * 15);
        return date;
    } else {
        // Find a spot between existing tasks
        for (let i = 0; i < tasks.length - 1; i++) {
            let now = tasks[i];
            let next = tasks[i + 1];

            if (now.endDate!.getTime() + trainMilliseconds < next.startDate!.getTime()) {
                // Found a spot
                return now.endDate!;
            }
        }

        let last = tasks[tasks.length - 1];
        return last.endDate!;
    }
}

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

        let allGpus = !!data.allGpus;
        let trainMilliseconds = 1000 * 60 * data.trainMinutes;

        let nextTasks = await prisma.task.findMany({
            where: {
                startDate: {
                    not: null,
                    gte: new Date(),
                },
                endDate: {
                    not: null,
                },
            },
            orderBy: {
                startDate: "asc",
            },
        });

        let scheduleDate: Date;
        let scheduleGpus = [] as number[];
        if (allGpus) {
            // Find a spot where all the gpus aren't used
            scheduleDate = findScheduleSpot(nextTasks, trainMilliseconds);
            scheduleGpus = new Array(GPU_COUNT).fill(0).map((_, i) => i);
        } else {
            // Find a spot on each specific gpu
            let scheduleDateCandidates = new Array(GPU_COUNT);
            for (let g = 0; g < GPU_COUNT; g++) {
                let gpuSpecificScheduleDate = findScheduleSpot(
                    nextTasks.filter((e) => e.gpus.includes(g)),
                    trainMilliseconds
                );
                scheduleDateCandidates[g] = gpuSpecificScheduleDate;
            }

            // Use the earliest available spot
            scheduleDate = scheduleDateCandidates[0];
            scheduleGpus = [0];
            for (let g = 1; g < scheduleDateCandidates.length; g++) {
                let gpuSpecificScheduleDate = scheduleDateCandidates[g];
                if (gpuSpecificScheduleDate.getTime() < scheduleDate.getTime()) {
                    scheduleDate = gpuSpecificScheduleDate;
                    scheduleGpus = [g];
                }
            }
        }

        let task = await prisma.task.create({
            data: {
                name: data.name,
                owner: {
                    connect: {
                        id: userId,
                    },
                },
                startDate: scheduleDate,
                endDate: new Date(scheduleDate.getTime() + trainMilliseconds),
                description: data.description,
                gpus: scheduleGpus,
            },
        });

        res.json(task);
    } else {
        return res.status(405).end();
    }
};
