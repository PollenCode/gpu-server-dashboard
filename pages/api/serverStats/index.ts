import {exec} from 'child_process';
const GPU_COMMAND = 'nvidia-smi --query-gpu=temperature.gpu,utilization.gpu --format=csv,noheader'; 
const CPU_TEMP_COMMAND = 'status -j';
const CPU_UTILISATION_COMMAND = `top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1"%"}'`;

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        exec(GPU_COMMAND,(error,stdout,stderr) => {
            res.json(stdout);
        });
    }else{
        return res.status(405).end();
    }
};