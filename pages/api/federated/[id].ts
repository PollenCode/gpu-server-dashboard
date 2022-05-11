import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "../../../auth";
import { prisma } from "../../../db";
import { docker } from "../../../docker";

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
        let inspectContainer = null;
        if (federated.containerId) {
            let container = docker.getContainer(federated.containerId);
            inspectContainer = await container.inspect();
        }

        return res.json({ federated, container: inspectContainer });
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

        if (federated.containerId) {
            let container = docker.getContainer(federated.containerId);
            let inspectContainer = await container.inspect();

            if (inspectContainer.State.Running) {
                await container.stop();
            }

            container
                .remove()
                .then(() => {
                    console.log("Docker container with id %s removed", federated?.containerId);
                })
                .catch((ex) => {
                    console.error("Could not remove docker container with id %s:", federated?.containerId, ex);
                });
        }

        return res.end();
    } else if (req.method === "POST") {
        let wantedRunning = req.body.running === true;

        if (!federated.containerId) {
            return res.status(400).end();
        }

        let container = docker.getContainer(federated.containerId);
        let inspectContainer = await container.inspect();

        if (wantedRunning) {
            if (!inspectContainer.State.Running) {
                await container.start();
            }
        } else {
            if (inspectContainer.State.Running) {
                await container.stop();
            }
        }

        return res.end();
    } else {
        return res.status(405).end();
    }
};
