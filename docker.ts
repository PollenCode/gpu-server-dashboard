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

export async function createJupyterContainer(port: number, token: string, version: string = "latest-gpu-jupyter") {
    const INTERNAL_PORT = 8888;

    // TODO: pass GPUs
    return await docker.createContainer({
        Image: JUPYTER_DOCKER_HUB_REPOSITORY + ":" + version,
        // This command is the entrypoint command in the tensorflow/tensorflow image and it sets the notebook token according to https://stackoverflow.com/questions/47092878/auto-configure-jupyter-password-from-command-line
        Cmd: [
            "bash",
            "-c",
            `source /etc/bash.bashrc && jupyter notebook --notebook-dir=/tf --ip 0.0.0.0 --no-browser --allow-root --NotebookApp.token='${token}'`,
        ],
        Labels: {
            Type: "task", // Contains user-defined labels
            TaskType: "jupyter",
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

export async function removeContainer(container: Docker.Container) {
    let inspectContainer = await container.inspect();
    if (inspectContainer.State.Running) {
        await container.stop();
    }
    await container.remove();
}
