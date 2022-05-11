import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser, getSessionUserId } from "../../../auth";
import { prisma } from "../../../db";
import { createFederatedContainer, docker } from "../../../docker";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let user = await getSessionUser(req, res);
    if (!user) return;

    if (user.role < 1) {
        return res.status(403).end();
    }

    if (req.method === "POST") {
        let federated = await prisma.federatedRuntime.create({
            data: {
                name: req.body.name,
                author: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        createFederatedContainer()
            .then(async (container) => {
                let updatedFederated = await prisma.federatedRuntime.update({
                    where: {
                        id: federated.id,
                    },
                    data: {
                        containerId: container.id,
                    },
                });
                console.log("Created federated container", updatedFederated);
            })
            .catch((ex) => {
                console.error("Could not create federated container", ex);
            });

        return res.json(federated);
    } else if (req.method === "GET") {
        let federated = await prisma.federatedRuntime.findMany({});
        return res.json(federated);
    } else {
        return res.status(405).end();
    }
};
