import Docker from "dockerode";
import { spawn } from "child_process";
import { mkdir } from "fs/promises";

export const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export const FEDERATED_DOCKER_HUB_REPOSITORY = process.env.FEDERATED_DOCKER_HUB_REPOSITORY || "codestix/federated";

export function getRandomPort() {
    // Pick random port, could be already taken but chance is very small
    return Math.floor(Math.random() * 50000 + 10000);
}

export async function createFederatedContainer(port: number, version: string = "0.23.0") {
    // As specified in https://github.com/tensorflow/federated/blob/main/tensorflow_federated/tools/runtime/remote_executor_service.py
    const FEDERATED_PORT = 8000;

    // See https://docs.docker.com/engine/api/v1.37/#operation/ContainerCreate
    return await docker.createContainer({
        Image: FEDERATED_DOCKER_HUB_REPOSITORY + ":" + version,
        HostConfig: {
            PortBindings: {
                [FEDERATED_PORT + "/tcp"]: [
                    {
                        HostPort: String(port),
                        HostIp: "0.0.0.0",
                    },
                ],
            },
        },
    });
}
