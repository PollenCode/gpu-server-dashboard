import Docker from "dockerode";
import { spawn } from "child_process";
import { mkdir } from "fs/promises";

export const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export const FEDERATED_DOCKER_HUB_REPOSITORY = process.env.FEDERATED_DOCKER_HUB_REPOSITORY || "codestix/federated";

export const JUPYTER_DOCKER_HUB_REPOSITORY = process.env.JUPYTER_DOCKER_HUB_REPOSITORY || "tensorflow/tensorflow";

export function getRandomPort() {
    // Pick random port, could be already taken but chance is very small
    return Math.floor(Math.random() * 50000 + 10000);
}

export async function createFederatedContainer(port: number, gpus: number[] = [], version: string = "0.23.0") {
    // As specified in https://github.com/tensorflow/federated/blob/main/tensorflow_federated/tools/runtime/remote_executor_service.py
    const INTERNAL_PORT = 8000;

    // See https://docs.docker.com/engine/api/v1.37/#operation/ContainerCreate
    return await docker.createContainer({
        Image: FEDERATED_DOCKER_HUB_REPOSITORY + ":" + version,
        HostConfig: {
            PortBindings: {
                [INTERNAL_PORT + "/tcp"]: [
                    {
                        HostPort: String(port),
                        HostIp: "0.0.0.0",
                    },
                ],
            },
        },
    });
}

export async function createJupyterContainer(port: number, version: string = "latest-gpu-jupyter") {
    const INTERNAL_PORT = 8888;

    // TODO: pass GPUs
    return await docker.createContainer({
        Image: JUPYTER_DOCKER_HUB_REPOSITORY + ":" + version,
        Labels: {
            Type: "jupyter", // Contains user-defined labels
        },
        HostConfig: {
            PortBindings: {
                [INTERNAL_PORT + "/tcp"]: [
                    {
                        HostPort: String(port),
                        HostIp: "0.0.0.0",
                    },
                ],
            },
        },
    });
}
