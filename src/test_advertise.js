const startAdvertising = require('./advertise');

const manufacturerData = "4c001006391eb6b52fdb01";
const duration = 300000;  // 300 seconds in milliseconds

console.log("Starting single advertisement test...");
startAdvertising(manufacturerData, duration);
