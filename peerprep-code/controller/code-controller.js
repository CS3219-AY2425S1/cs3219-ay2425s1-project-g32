import Docker from 'dockerode';
import fs from 'fs';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
import path from 'path';
import { dockerPull, images } from '../utils/index.js';

const docker = new Docker({
    protocol: 'https', host: '127.0.0.1', port: 2376,
    ca: fs.readFileSync('/certs/client/ca.pem'),
    cert: fs.readFileSync('/certs/client/cert.pem'),
    key: fs.readFileSync('/certs/client/key.pem'),
});
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

class ContainerTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = "ContainerTimeoutError";
    }
}

export const runCode = async (req, res) => {
    const { language, code } = req.body;

    // Validate input
    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required.' });
    }

    let imageName;
    let command;
    let extension;
    const randomString = randomBytes(8).toString('hex')

    switch (language) {
        case 'python':
            imageName = images.PYTHON;
            command = ['python', '/app/main.py'];
            extension = 'py';
            break;
        case 'javascript':
            imageName = images.JAVASCRIPT;
            command = ['node', '/app/main.js'];
            extension = 'js';
            break;
        case 'c':
            imageName = images.C;
            command = ['sh', '-c', 'gcc /app/main.c -o /app/main && /app/main'];
            extension = 'c';
            break;
        case 'c++':
            imageName = images.C;
            command = ['sh', '-c', 'g++ /app/main.cpp -o /app/main && /app/main'];
            extension = 'cpp';
            break;
        case 'go':
            imageName = images.GO;
            command = ['go', 'run', '/app/main.go'];
            extension = 'go';
            break;
        case 'rust':
            imageName = images.RUST;
            command = ['sh', '-c', 'rustc /app/main.rs -o /app/main && /app/main'];
            extension = 'rs';
            break;
        default:
            return res.status(400).json({ error: 'Unsupported language.' });
    }

    const fileName = `temp_${randomString}.${extension}`;
    const filePath = path.join('/tmp', fileName);

    try {
        let output = '';
        let error = '';

        await writeFile(filePath, code);

        // Pull the Docker image if it's not already present
        // TODO: should try pulling all images already on host container startup
        await dockerPull(docker, imageName);

        const container = await docker.createContainer({
            Image: imageName,
            Cmd: command,
            Tty: false,
            HostConfig: {
                Binds: [`${filePath}:/app/main.${extension}`],
            },
        });

        // Start the container
        await container.start();

        // Attach the container's output streams
        const stream = await container.attach({
            stream: true,
            stdout: true,
            stderr: true,
        });

        // Create writable streams to capture stdout and stderr
        const stdoutStream = {
            write: (chunk) => (output += chunk.toString()),
        };
        const stderrStream = {
            write: (chunk) => (error += chunk.toString()),
        };

        // Use demuxStream to separate stdout and stderr
        container.modem.demuxStream(stream, stdoutStream, stderrStream);

        let timeout;
        const timeoutPromise = new Promise((_, reject) =>
            timeout = setTimeout(() => {
                container.kill();
                reject(new ContainerTimeoutError('Execution timed out'));
            }, 10000)
        );
        await Promise.race([container.wait().then(() => { clearTimeout(timeout) }), timeoutPromise]);

        // Remove the container
        await container.remove();

        // Delete the temporary file on the host
        await unlink(filePath);

        // Send back the stdout, stderr, and exit code
        res.json({ output, error });
    } catch (err) {
        console.log(err)

        // Cleanup in case of an error
        if (fs.existsSync(filePath)) {
            await unlink(filePath);
        }

        if (err instanceof ContainerTimeoutError) {
            return res.json({ output: "", error: "Time limit exceeded" });
        }
        res.status(500).json({ error: 'Error running code in Docker container.' });
    }
};
