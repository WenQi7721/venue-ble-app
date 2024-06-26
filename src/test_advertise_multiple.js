const startAdvertising = require('./advertise');

const advertisements = [
    {
        name: "TestPeripheral1",
        manufacturerData: "4c001006391eb6b52fdb01",
        primaryServiceUUID: "fffffffffffffffffffffffffffffff0",
        characteristicUUID: "fffffffffffffffffffffffffffffff1",
        duration: 300000  // 300 seconds in milliseconds
    },
    {
        name: "TestPeripheral2",
        manufacturerData: "001006391eb6b0001",
        primaryServiceUUID: "fffffffffffffffffffffffffffffff2",
        characteristicUUID: "fffffffffffffffffffffffffffffff3",
        duration: 300000
    },
    {
        name: "TestPeripheral3",
        manufacturerData: "04636601006391eb6b01",
        primaryServiceUUID: "fffffffffffffffffffffffffffffff4",
        characteristicUUID: "fffffffffffffffffffffffffffffff5",
        duration: 300000
    }
];

const advertisePackage = (ad) => {
    const bleno = require('@abandonware/bleno');

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

    bleno.on('stateChange', (state) => {
        console.log(`State changed: ${state}`);

        if (state === 'poweredOn') {
            const myCharacteristic = createCharacteristic(ad.characteristicUUID, ad.manufacturerData);
            const myPrimaryService = new bleno.PrimaryService({
                uuid: ad.primaryServiceUUID,
                characteristics: [myCharacteristic]
            });

            bleno.startAdvertising(ad.name, [ad.primaryServiceUUID], (error) => {
                if (error) {
                    console.error(`Advertising start error: ${error}`);
                } else {
                    console.log('Advertising started successfully');
                    bleno.setServices([myPrimaryService], (err) => {
                        if (err) {
                            console.error(`Set services error: ${err}`);
                        } else {
                            console.log('Services set successfully');
                            setTimeout(() => {
                                bleno.stopAdvertising(() => {
                                    console.log('Advertising stopped after duration');
                                });
                            }, ad.duration);
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

console.log("Starting multiple advertisements test...");

advertisements.forEach((ad, index) => {
    console.log(`Starting advertisement ${index + 1}...`);
    advertisePackage(ad);
});
