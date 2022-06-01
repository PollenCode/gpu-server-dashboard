import {exec} from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';

const GPU_COMMAND = "nvidia-smi --query-gpu=temperature.gpu,utilization.gpu --format=csv,noheader"; 
const CPU_TEMP_COMMAND = "sensors -j";
const CPU_UTILISATION_COMMAND = `top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1"%"}'`;

async function executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command,(error, stdout, stderr) => {
            if (error) {
                reject(error)
            }
            else {
                resolve(stdout);
            }
        })
    })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {

        let gpuCommandResponse = await executeCommand(GPU_COMMAND);
        let gpuData = gpuCommandResponse.trim().split("\n").map((e) => {
            let s = e.split(",");
            return {
                temperature: parseFloat(s[0]),
                usage: parseFloat(s[1].replace(/[^0-9,.]/g, "")),
            }
        })

        let cpuTempCommandResponse = JSON.parse(await executeCommand(CPU_TEMP_COMMAND));
        let cpuUtilCommandResponse = await executeCommand(CPU_UTILISATION_COMMAND);

        let cpuData = {
            temperature: cpuTempCommandResponse["coretemp-isa-0000"]["Package id 0"]["temp1_input"],
            usage: parseFloat(cpuUtilCommandResponse.trim().replace(/[^0-9,.]/g, ""))
        }

        res.json({
            gpu: gpuData,
            cpu: cpuData
        })
    }else{
        return res.status(405).end();
    }
};