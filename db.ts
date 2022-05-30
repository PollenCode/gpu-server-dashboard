import { PrismaClient } from "@prisma/client";
import { alignDate, getFirstFreeSpot } from "./scheduler";
import { IS_DEV } from "./util";

export const prisma = new PrismaClient();

export async function getSetting<T = any>(key: string, ifNotExist?: T): Promise<T> {
    let value = await prisma.settings.findUnique({
        where: {
            key: key,
        },
    });

    if (value === null) {
        return ifNotExist!;
    } else {
        return value.value as T;
    }
}

export async function setSettingDefaultValue(key: string, defaultValue: any) {
    try {
        await prisma.settings.create({
            data: {
                key: key,
                value: defaultValue,
            },
        });
    } catch (ex) {}
}

export async function setSetting(key: string, value: any) {
    await prisma.settings.update({
        where: {
            key: key,
        },
        data: {
            value: value,
        },
    });
}

export const SETTING_MAX_TIME_BEFORE_APPROVAL = "maxTimeBeforeApprovalRequired";
export const SETTING_GPU_COUNT = "gpuCount";
export const SETTING_MULTI_GPU_APPROVAL = "approvalRequiredForMultiGpu";

setSettingDefaultValue(SETTING_MAX_TIME_BEFORE_APPROVAL, 1000 * 60 * 60 * 8);
setSettingDefaultValue(SETTING_GPU_COUNT, 2);
setSettingDefaultValue(SETTING_MULTI_GPU_APPROVAL, true);

export async function findScheduleSpot(trainMilliseconds: number, allGpus: boolean): Promise<{ date: Date; gpus: number[] }> {
    let minDate = alignDate(new Date(), IS_DEV ? 1000 * 60 * 60 : 1000 * 60 * 60);

    let nextTasks = await prisma.task.findMany({
        where: {
            endDate: {
                gte: minDate,
            },
        },
        orderBy: {
            startDate: "asc",
        },
    });

    let gpuCount = await getSetting<number>(SETTING_GPU_COUNT);

    let scheduleDate: Date;
    let scheduleGpus = [] as number[];
    if (allGpus) {
        // Find a spot where all the gpus aren't used
        scheduleDate = getFirstFreeSpot(nextTasks, trainMilliseconds, minDate);
        scheduleGpus = new Array(gpuCount).fill(0).map((_, i) => i);
    } else {
        // Find a spot on each specific gpu
        let scheduleDateCandidates = new Array(gpuCount);
        for (let g = 0; g < gpuCount; g++) {
            let gpuSpecificScheduleDate = getFirstFreeSpot(
                nextTasks.filter((e) => e.gpus.includes(g)),
                trainMilliseconds,
                minDate
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

    return {
        date: scheduleDate,
        gpus: scheduleGpus,
    };
}
