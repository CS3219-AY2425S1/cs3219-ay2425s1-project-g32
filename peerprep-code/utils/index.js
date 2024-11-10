export const images = Object.freeze({
    PYTHON: "python:3.9-slim",
    JAVASCRIPT: "node:23.1.0-slim",
    C: "gcc:14.2.0",
    GO: "golang:1.16.5",
    RUST: "rust:1.82.0"
});

export const dockerPull = (docker, repoTag) => {
    return new Promise((resolve, reject) => {
        docker.pull(repoTag, (err, stream) => {
            if (err) {
                return reject(err);
            }

            // Use dockerode's built-in modem to follow the stream
            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err, output) {
                if (err) {
                    return reject(err);
                }
                resolve(output);
            }

            function onProgress(event) {
            }
        });
    });
};

export const pullAllImages = async (docker) => {
    const promises = Object.entries(images).map(async ([language, repoTag]) => {
        console.log(`Starting pull for ${language} (${repoTag})...`);
        try {
            const result = await dockerPull(docker, repoTag);
            console.log(`Finished pull for ${language} (${repoTag}).`);
            return result;
        } catch (error) {
            console.error(`Error pulling ${language} (${repoTag}):`, error);
            throw error; // Rethrow to ensure Promise.all catches it
        }
    });

    try {
        const results = await Promise.all(promises);
        console.log("All images pulled successfully!");
    } catch (error) {
        console.error("Error pulling images:", error);
    }
}