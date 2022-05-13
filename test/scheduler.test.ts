import { Task } from "@prisma/client";
import { findScheduleSpot } from "../pages/api/task"



it("finds a scheduled spot", () => {

    ,
    
    let spot = findScheduleSpot(tasks, 1000 * 60 * 60, false);

    expect(spot).toBe(new Date("2022-05-10T11:55:26.176Z"));

})