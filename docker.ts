import Docker from "dockerode";
import { spawn } from "child_process";
import { mkdir } from "fs/promises";

export const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export const FEDERATED_DOCKER_HUB_REPOSITORY = process.env.FEDERATED_DOCKER_HUB_REPOSITORY || "codestix/federated";

export async function createFederatedContainer(version: string = "0.23.0") {
    return await docker.createContainer({
        Image: FEDERATED_DOCKER_HUB_REPOSITORY + ":" + version,
        ExposedPorts: {
            "7000": {},
        },
    });
}
