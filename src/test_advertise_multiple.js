const startAdvertising = require('./advertise');
const EventEmitter = require('events');
const io = new EventEmitter();

const advertisements = [
    { name: "Peripheral1", data: "4c001006391eb6b52fdb01", duration: 300000 },  // 300 seconds in milliseconds
    { name: "Peripheral2", data: "001006391eb6b0001", duration: 300000 },
    { name: "Peripheral3", data: "04636601006391eb6b01", duration: 300000 }
];

const advertiseNext = (index) => {
    if (index < advertisements.length) {
        const ad = advertisements[index];
        console.log(`Starting advertisement ${index + 1} with name: ${ad.name} and data: ${ad.data}`);
        startAdvertising(ad.name, ad.data, ad.duration, io);

        // Set a delay to start the next advertisement
        setTimeout(() => {
            advertiseNext(index + 1);
        }, 1000);  // Wait 1 second before starting the next advertisement
    }
};

console.log("Starting multiple advertisements test...");
advertiseNext(0);
