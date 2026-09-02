import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { stdout, stderr } = await execPromise('dstat -tcms --disk --net -N lo 1 1 2>/dev/null', {
            timeout: 5000
        });

        if (stderr) {
            console.error('dstat error:', stderr);
        }

        const lines = stdout.trim().split('\n');
        const dataLine = lines[lines.length - 1];
        const values = dataLine.split(/\s+/).filter(v => v);

        const metrics = {
            cpu: parseFloat(values[1]) || 0,
            mem: parseFloat(values[2]) || 0,
            netIn: parseFloat(values[3]) || 0,
            netOut: parseFloat(values[4]) || 0,
            diskRead: parseFloat(values[5]) || 0,
            diskWrite: parseFloat(values[6]) || 0,
            raw: stdout.slice(-500)
        };

        return res.status(200).json(metrics);
    } catch (error) {
        console.error('Error executing dstat:', error.message);

        return res.status(200).json({
            cpu: Math.random() * 100,
            mem: Math.random() * 100,
            netIn: Math.random() * 50,
            netOut: Math.random() * 50,
            diskRead: Math.random() * 30,
            diskWrite: Math.random() * 30,
            raw: 'dstat not available - mock data shown'
        });
    }
}
