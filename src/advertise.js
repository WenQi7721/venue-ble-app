const bleno = require('@abandonware/bleno');

const deviceName = 'Yes';

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
const startAdvertising = (manufacturerData, duration) => {
    bleno.on('stateChange', (state) => {
        console.log(`State changed: ${state}`);

        if (state === 'poweredOn') {
            // Setup primary service UUID and characteristic based on manufacturerData
            const primaryServiceUUID = 'fffffffffffffffffffffffffffffff0'; // Could be dynamic based on use case
            const characteristicUUID = 'fffffffffffffffffffffffffffffff1'; // Could be dynamic based on use case

            const myCharacteristic = createCharacteristic(characteristicUUID, manufacturerData.toString());
            const myPrimaryService = new bleno.PrimaryService({
                uuid: primaryServiceUUID,
                characteristics: [myCharacteristic]
            });

            bleno.startAdvertising(deviceName, [primaryServiceUUID], (error) => {
                if (error) {
                    console.error(`Advertising start error: ${error}`);
                } else {
                    console.log('Advertising started successfully');
                    // Set the BLE services with the dynamic characteristics
                    bleno.setServices([myPrimaryService], (err) => {
                        if (err) {
                            console.error(`Set services error: ${err}`);
                        } else {
                            console.log('Services set successfully');
                            // Automatically stop advertising after the specified duration
                            setTimeout(() => {
                                bleno.stopAdvertising(() => {
                                    console.log('Advertising stopped after duration');
                                });
                            }, duration);
                        }
                    });
                }
            });
        } else {
            bleno.stopAdvertising();
        }
    });

    bleno.on('advertisingStart', (error) => {
        if (error) {
            console.error(`Advertising start error: ${error}`);
        } else {
            console.log('Advertising started successfully');
        }
    });

    bleno.on('accept', (clientAddress) => {
        console.log(`Client connected: ${clientAddress}`);
    });

    bleno.on('disconnect', (clientAddress) => {
        console.log(`Client disconnected: ${clientAddress}`);
    });
};

module.exports = startAdvertising;
