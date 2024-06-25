const noble = require('@abandonware/noble');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

// Create CSV writer
const csvWriter = createObjectCsvWriter({
    path: 'peripherals.csv',
    header: [
        {id: 'localName', title: 'Local Name'},
        {id: 'uuid', title: 'UUID'},
        {id: 'manufacturerData', title: 'Manufacturer Data'},
        {id: 'rssi', title: 'RSSI'}
    ]
});

const peripheralsData = new Map();

const startScanning = (socket) => {
    noble.on('stateChange', (state) => {
        if (state === 'poweredOn') {
            noble.startScanning([], true);
        } else {
            noble.stopScanning();
        }
        socket.emit('nobleStateChange', state);
    });

    noble.on('discover', (peripheral) => {
        const localName = peripheral.advertisement.localName;
        const manufacturerData = peripheral.advertisement.manufacturerData ? peripheral.advertisement.manufacturerData.toString('hex') : '';
        const rssi = peripheral.rssi;

        if (localName === 'TestPeripheral') {
            // Check for duplicates using the UUID
            if (!peripheralsData.has(peripheral.uuid)) {
                console.log(`Peripheral discovered: ${localName} (${peripheral.uuid})`);
                console.log(`Manufacturer Data: ${manufacturerData}`);
                console.log(`RSSI: ${rssi}`);
                
                socket.emit('peripheralDiscovered', {
                    localName: localName,
                    uuid: peripheral.uuid,
                    manufacturerData: manufacturerData,
                    rssi: rssi
                });

                peripheralsData.set(peripheral.uuid, {
                    localName: localName,
                    uuid: peripheral.uuid,
                    manufacturerData: manufacturerData,
                    rssi: rssi
                });

                // Write data to CSV
                csvWriter.writeRecords(Array.from(peripheralsData.values()))
                    .then(() => {
                        console.log('Data saved to CSV file');
                    });
            }
        }
    });
};

module.exports = startScanning;
