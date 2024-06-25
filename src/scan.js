const noble = require('@abandonware/noble');

const startScanning = (io) => {
    noble.on('stateChange', (state) => {
        if (state === 'poweredOn') {
            noble.startScanning([], true);
        } else {
            noble.stopScanning();
        }
        io.emit('nobleStateChange', state);
    });

    noble.on('discover', (peripheral) => {
        console.log(`Peripheral discovered: ${peripheral.advertisement.localName} (${peripheral.uuid})`);
        io.emit('peripheralDiscovered', {
            localName: peripheral.advertisement.localName,
            uuid: peripheral.uuid
        });
    });
};

module.exports = startScanning;
