import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUserId } from "../../../auth";
import { findScheduleSpot } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let userId = await getSessionUserId(req, res);
    if (!userId) {
        return res.status(401).end();
    }

    if (req.method === "POST") {
        let data = req.body;
        let allGpus = !!data.allGpus;
        let trainMilliseconds = 1000 * 60 * data.trainMinutes;

        let { date, gpus } = await findScheduleSpot(trainMilliseconds, allGpus);

        res.json({
            date,
            gpus,
        });
    } else {
        return res.status(405).end();
    }
};
