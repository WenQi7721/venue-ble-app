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
const startAdvertising = (deviceName, primaryServiceUUID, characteristicUUID, manufacturerData, duration, callback) => {
    const handleStateChange = (state) => {
        console.log(`State changed: ${state}`);

        if (state === 'poweredOn') {
            const myCharacteristic = createCharacteristic(characteristicUUID, manufacturerData.toString());
            const myPrimaryService = new bleno.PrimaryService({
                uuid: primaryServiceUUID,
                characteristics: [myCharacteristic]
            });

            bleno.startAdvertising(deviceName, [primaryServiceUUID], (error) => {
                if (error) {
                    console.error(`Advertising start error: ${error}`);
                    callback(error);
                } else {
                    console.log('Advertising started successfully');
                    bleno.setServices([myPrimaryService], (err) => {
                        if (err) {
                            console.error(`Set services error: ${err}`);
                            callback(err);
                        } else {
                            console.log('Services set successfully');
                            setTimeout(() => {
                                bleno.stopAdvertising(() => {
                                    console.log('Advertising stopped after duration');
                                    bleno.removeListener('stateChange', handleStateChange);
                                    callback(null);
                                });
                            }, duration);
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

module.exports = startAdvertising;
