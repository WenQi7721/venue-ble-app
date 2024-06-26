const startAdvertising = require('../src/advertise');

const advertisements = [
    { 
        deviceName: 'Device2', 
        primaryServiceUUID: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0', 
        characteristicUUID: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1', 
        manufacturerData: "001006391eb6b0001", 
        duration: 30000 // 30 seconds for testing
    }
];

console.log("Starting multiple advertisements test...");

function advertiseSequentially(index) {
    if (index < advertisements.length) {
        const ad = advertisements[index];
        console.log(`Starting advertisement ${index + 1} with device name ${ad.deviceName}...`);
        startAdvertising(ad.deviceName, ad.primaryServiceUUID, ad.characteristicUUID, ad.manufacturerData, ad.duration, (error) => {
            if (error) {
                console.error(`Error advertising UUID ${ad.primaryServiceUUID}: ${error}`);
            } else {
                console.log(`Finished advertisement ${index + 1}`);
                advertiseSequentially(index + 1);
            }
        });
    } else {
        console.log("All advertisements completed.");
    }
}

advertiseSequentially(0);
