const startAdvertising = require('./advertise');

const advertisements = [
    { 
        deviceName: 'Device1', 
        primaryServiceUUID: 'fffffffffffffffffffffffffffffff2', 
        characteristicUUID: 'fffffffffffffffffffffffffffffff1', 
        manufacturerData: "4c001006391eb6b52fdb01", 
        duration: 10000 // 10 seconds for testing
    },
    { 
        deviceName: 'Device2', 
        primaryServiceUUID: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0', 
        characteristicUUID: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1', 
        manufacturerData: "001006391eb6b0001", 
        duration: 10000 // 10 seconds for testing
    },
    { 
        deviceName: 'Device3', 
        primaryServiceUUID: 'ddddddddddddddddddddddddddddddd0', 
        characteristicUUID: 'ddddddddddddddddddddddddddddddd1', 
        manufacturerData: "04636601006391eb6b01", 
        duration: 10000 // 10 seconds for testing
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
