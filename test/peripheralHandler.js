const bleno = require('@abandonware/bleno');

// Function to create characteristics based on payload
function createCharacteristic(uuid, payload) {
    return new bleno.Characteristic({
        uuid: uuid,
        properties: ['read', 'write'],
        onReadRequest: function (offset, callback) {
            console.log('Read request received');
            const data = Buffer.from(payload);
            callback(this.RESULT_SUCCESS, data);
        },
        onWriteRequest: function (data, offset, withoutResponse, callback) {
            console.log(`Write request received: ${data.toString()}`);
            callback(this.RESULT_SUCCESS);
        }
    });
}

// Function to start advertising for a specific duration with dynamic characteristics
const startAdvertising = (config, callback) => {
    const handleStateChange = (state) => {
        console.log(`State changed: ${state}`);

        if (state === 'poweredOn') {
            const myCharacteristic = createCharacteristic(config.characteristicUUID, config.manufacturerData);
            const myPrimaryService = new bleno.PrimaryService({
                uuid: config.primaryServiceUUID,
                characteristics: [myCharacteristic]
            });

            bleno.startAdvertising(config.deviceName, [config.primaryServiceUUID], (error) => {
                if (error) {
                    console.error(`Advertising start error: ${error}`);
                    callback(error);
                } else {
                    console.log(`${config.deviceName} advertising started successfully`);
                    bleno.setServices([myPrimaryService], (err) => {
                        if (err) {
                            console.error(`Set services error: ${err}`);
                            callback(err);
                        } else {
                            console.log('Services set successfully');
                            setTimeout(() => {
                                bleno.stopAdvertising(() => {
                                    console.log(`${config.deviceName} advertising stopped after duration`);
                                    bleno.removeListener('stateChange', handleStateChange);
                                    callback(null);
                                });
                            }, config.duration);
                        }
                    });
                }
            });
        } else {
            bleno.stopAdvertising(() => {
                bleno.removeListener('stateChange', handleStateChange);
            });
        }
    };

    bleno.on('stateChange', handleStateChange);
};

const configurations = [
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

let currentIndex = 0;

const runNextConfiguration = () => {
    if (currentIndex < configurations.length) {
        startAdvertising(configurations[currentIndex], (error) => {
            if (error) {
                console.error(`Failed to start advertising: ${error}`);
            } else {
                console.log(`Advertising finished successfully for ${configurations[currentIndex].deviceName}`);
                currentIndex++;
                if (currentIndex < configurations.length) {
                    setTimeout(runNextConfiguration, 2000); // Add a delay of 2 seconds before starting the next one
                } else {
                    console.log('All configurations have been processed.');
                }
            }
        });
    }
};

runNextConfiguration();
