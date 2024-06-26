const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { exec } = require('child_process');

const baseDir = path.dirname(path.dirname(__filename));
const inputFilePath = path.join(baseDir, 'fake_processed_tickets.csv');
let lastSeenData = new Set();

function readCsv(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => {
                console.log(`Read ${data.length} records from CSV.`);
                resolve(data);
            })
            .on('error', reject);
    });
}

function advertise(uuid, isValid) {
    return new Promise((resolve, reject) => {
        const manufacturerData = `${uuid}${isValid ? '01' : '00'}`;
        const duration = 300000; // 300 seconds in milliseconds
        const command = `node advertise.js ${manufacturerData} ${duration}`;
        console.log(`Running advertising command for UUID ${uuid}...`);

        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error advertising UUID ${uuid}: ${error}`);
                return reject(error);
            }
            console.log(`Advertising command completed for UUID ${uuid}.`);
            console.log(stdout);
            console.error(stderr);
            resolve();
        });
    });
}

async function main() {
    console.log("Starting main loop of the ticket processing and advertising system...");
    while (true) {
        if (fs.existsSync(inputFilePath)) {
            console.log(`Checking for new data in ${inputFilePath}`);
            const currentData = new Set((await readCsv(inputFilePath)).map(JSON.stringify));
            const newEntries = [...currentData].filter(entry => !lastSeenData.has(entry));
            if (newEntries.length > 0) {
                console.log(`Found ${newEntries.length} new entries. Processing new entries...`);
                for (const entry of newEntries) {
                    const data = JSON.parse(entry);
                    const uuid = data['UUID'];
                    const isValid = data['is_valid'] === 'True';
                    console.log(`Advertising for UUID ${uuid} with validity ${isValid}`);
                    await advertise(uuid, isValid);
                }
                lastSeenData = currentData;
            }
        } else {
            console.log(`No file found at ${inputFilePath}, will check again in 10 seconds.`);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

main().catch(console.error);
