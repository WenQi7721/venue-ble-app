const bleno = require('@abandonware/bleno');

const primaryServiceUUID = 'fffffffffffffffffffffffffffffff0';
const characteristicUUID = 'fffffffffffffffffffffffffffffff1';
const deviceName = 'Result';

const { Characteristic, PrimaryService } = bleno;

class MyCharacteristic extends Characteristic {
    constructor() {
        super({
            uuid: characteristicUUID,
            properties: ['read', 'write'],
        });
    }

    onReadRequest(offset, callback) {
        console.log('Read request received');
        const data = Buffer.from('Hello World');
        callback(this.RESULT_SUCCESS, data);
    }

    onWriteRequest(data, offset, withoutResponse, callback) {
        console.log(`Write request received: ${data.toString()}`);
        callback(this.RESULT_SUCCESS);
    }
}

const myCharacteristic = new MyCharacteristic();

const myPrimaryService = new PrimaryService({
    uuid: primaryServiceUUID,
    characteristics: [myCharacteristic]
});

// Function to start advertising for a specific duration
const startAdvertising = (io, manufacturerData, duration) => {
    bleno.on('stateChange', (state) => {
        console.log(`State changed: ${state}`);
        io.emit('blenoStateChange', state);
        if (state === 'poweredOn') {
            bleno.startAdvertising(deviceName, [primaryServiceUUID], (error) => {
                if (error) {
                    console.error(`Advertising start error: ${error}`);
                } else {
                    console.log('Advertising started successfully');
                    bleno.setServices([myPrimaryService], (err) => {
                        if (err) {
                            console.error(`Set services error: ${err}`);
                        } else {
                            console.log('Services set successfully');
                            io.emit('advertisingStarted');
                            bleno.updateRssi();
                            setTimeout(() => {
                                bleno.stopAdvertising(() => {
                                    console.log('Advertising stopped after duration');
                                });
                            }, duration);
                        }
                    });
                }
            }, manufacturerData);
        } else {
            bleno.stopAdvertising();
        }
    });

    bleno.on('advertisingStart', (error) => {
        if (error) {
            console.error(`Advertising start error: ${error}`);
            io.emit('advertisingStartError', error);
        } else {
            console.log('Advertising started successfully');
        }
    });

    bleno.on('accept', (clientAddress) => {
        console.log(`Client connected: ${clientAddress}`);
        io.emit('clientConnected', clientAddress);
    });

    bleno.on('disconnect', (clientAddress) => {
        console.log(`Client disconnected: ${clientAddress}`);
        io.emit('clientDisconnected', clientAddress);
    });
};

module.exports = startAdvertising;
