import { prisma } from "../../../db";
import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "../../../auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let user = await getSessionUser(req, res);

    if (!user) {
        return res.status(401).end();
    }

    if (req.method === "GET") {
        let tasks = await prisma.task.findMany({
            where: {
                ownerId: user.id,
            },
            orderBy: {
                startDate: "desc",
            },
        });

        res.json(tasks);
    } else {
        return res.status(405).end();
    }
};
