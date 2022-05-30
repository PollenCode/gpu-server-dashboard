// export function findScheduleSpotIn(tasks: Task[], trainMilliseconds: number, allGpus: boolean): Date {
//     if (tasks.length <= 0) {
//         if (IS_DEV) {
//             // Schedule in 5 seconds
//             return new Date(new Date().getTime() + 1000 * 5);
//         } else {
//             // Schedule in 15 minutes
//             let date = new Date(new Date().getTime() + 1000 * 60 * 15);
//             date.setMilliseconds(0);
//             date.setSeconds(0);
//             // Align to next 15 minutes
//             date.setMinutes((Math.floor(date.getMinutes() / 15) + 1) * 15);
//             return date;
//         }
//     } else {
//         // Find a spot between existing tasks
//         for (let i = 0; i < tasks.length - 1; i++) {
//             let now = tasks[i];
//             let next = tasks[i + 1];

//             if (now.endDate!.getTime() + trainMilliseconds < next.startDate!.getTime()) {
//                 // Found a spot
//                 return now.endDate!;
//             }
//         }

//         if (allGpus) {
//             let lastEndingDate = tasks[0].endDate!;
//             for (let i = 1; i < tasks.length; i++) {
//                 if (tasks[i].endDate!.getTime() > lastEndingDate.getTime()) {
//                     lastEndingDate = tasks[i].endDate!;
//                 }
//             }
//             return lastEndingDate;
//         } else {
//             let last = tasks[tasks.length - 1];
//             return last.endDate!;
//         }
//     }
// }

type TakenSpot = { startDate: Date; endDate: Date };

export function alignDate(date: Date, milliseconds: number): Date {
    let t = date.getTime();
    return new Date(t + (milliseconds - (t % milliseconds)));
}

export function combineSpots(spots: TakenSpot[]): TakenSpot[] {
    if (spots.length <= 1) {
        return spots;
    }

    let s = [...spots];
    s.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    let newSpots = [s[0]];
    for (let i = 1; i < s.length; i++) {
        let spot = s[i];
        let previousSpot = newSpots[newSpots.length - 1];

        if (
            new Date(spot.startDate).getTime() >= new Date(previousSpot.startDate).getTime() &&
            new Date(spot.startDate).getTime() <= new Date(previousSpot.endDate).getTime()
        ) {
            // The previous spot contains this spots start date
            if (new Date(spot.endDate).getTime() >= new Date(previousSpot.endDate).getTime()) {
                // The end date is after the end date of the previous spot, extend the previous spot
                previousSpot.endDate = spot.endDate;
            } else {
                // The end date is contained in the previous spot aswel, do nothing
            }
        } else {
            newSpots.push({ ...spot });
        }
    }

    return newSpots;
}

export function getFirstFreeSpot(takenSpots: TakenSpot[], milliseconds: number, minDate: Date): Date {
    let combined = combineSpots(takenSpots);

    let currentStartDate = minDate;
    for (let i = 0; i < combined.length; i++) {
        let nextSpot = combined[i];

        if (currentStartDate.getTime() + milliseconds < nextSpot.startDate.getTime()) {
            // This is a free spot
            return currentStartDate;
        }

        currentStartDate = nextSpot.endDate;
    }

    return currentStartDate;
}

export function getFreeSpots(takenSpots: TakenSpot[], milliseconds: number, minDate: Date): Date[] {
    let combined = combineSpots(takenSpots);

    let spots = [];
    let currentStartDate = minDate;
    for (let i = 0; i < combined.length; i++) {
        let nextSpot = combined[i];

        if (currentStartDate.getTime() + milliseconds < nextSpot.startDate.getTime()) {
            // This is a free spot
            spots.push(currentStartDate);
        }

        currentStartDate = nextSpot.endDate;
    }

    spots.push(currentStartDate);
    return spots;
}

export function isSpotTaken(takenSpots: TakenSpot[], milliseconds: number, minDate: Date): boolean {
    let combined = combineSpots(takenSpots);

    let maxDate = new Date(minDate.getTime() + milliseconds);

    for (let i = 0; i < combined.length; i++) {
        let spot = combined[i];
        let spotStartTime = new Date(spot.startDate).getTime();
        let spotEndTime = new Date(spot.endDate).getTime();
        if (maxDate.getTime() < spotStartTime) {
            break;
        }

        // If the min or max date is contained in any subsequent taken spot, the spot is considered taken
        if (
            (minDate.getTime() >= spotStartTime && minDate.getTime() < spotEndTime) ||
            (maxDate.getTime() >= spotStartTime && maxDate.getTime() < spotEndTime)
        ) {
            return true;
        }
    }

    return false;
}
