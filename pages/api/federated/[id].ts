import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "../../../auth";
import { prisma } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let user = await getSessionUser(req, res);
    if (!user) return;

    if (user.role < 1) {
        return res.status(403).end();
    }

    let id = parseInt(req.query.id as string);
    if (isNaN(id)) {
        return res.status(406).end();
    }

    let federated = await prisma.federatedRuntime.findUnique({
        where: {
            id: id,
        },
        include: {
            author: {
                select: {
                    id: true,
                    role: true,
                },
            },
        },
    });

    if (!federated) {
        return res.status(404).end();
    }

    if (req.method === "GET") {
        return res.json(federated);
    } else if (req.method === "PUT") {
        let newName = req.body.newName;
        if (typeof newName !== "string" || !/^[a-zA-Z0-9_ -]{1,30}$/.test(newName)) {
            return res.status(406).end();
        }

        // Only authors and users with a higher role can update this federated runtime
        if (federated.author && federated.author.id != user.id && federated.author.role >= user.role) {
            return res.status(403).end();
        }

        let updatedFederated = await prisma.federatedRuntime.update({
            where: {
                id: id,
            },
            data: {
                name: newName,
            },
        });

        return res.json(updatedFederated);
    } else if (req.method === "DELETE") {
        // Only authors and users with a higher role can delete this federated runtime
        if (federated.author && federated.author.id != user.id && federated.author.role >= user.role) {
            return res.status(403).end();
        }

        await prisma.federatedRuntime.delete({
            where: {
                id: id,
            },
        });

        return res.end();
    } else {
        return res.status(405).end();
    }
};
