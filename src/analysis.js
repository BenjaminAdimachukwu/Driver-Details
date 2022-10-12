const { getTrips, getDriver } = require('./node_modules/api/index');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  try {
    const tripInformation = await getTrips();
    
    // decalarations
    const result = {};

    let noOfCashTrips = 0;
    let noOfNonCashTrips = 0;
    let billedTotal = 0;
    let cashBilledTotal = 0;
    let nonCashBilledTotal = 0;
    let driversWithMultiplyCars = 0;
    const mostTripsByDriver = {};
    const highestEarningDriver = {};

    const tripCount = {};
    const driverBilledAmount = {};

    tripInformation.forEach((eachTrip) => {
      if (typeof eachTrip['billedAmount'] === 'string') {
        eachTrip['billedAmount'] = Number(eachTrip['billedAmount'].split(',').join(''));
      }
      
      if (eachTrip['isCash'] === true) {
        billedTotal += eachTrip['billedAmount'];
        noOfCashTrips++;
        cashBilledTotal += eachTrip['billedAmount'];
      }
      if (eachTrip['isCash'] === false) {
        billedTotal += eachTrip['billedAmount'];
        noOfNonCashTrips++;
        nonCashBilledTotal += eachTrip['billedAmount'];
      }

      //keeping track of the number of trips and driver total amount earned
      const driverId = eachTrip['driverID'];
      if (!tripCount[driverId]) {
        tripCount[driverId] = 1;
        driverBilledAmount[driverId] = eachTrip['billedAmount'];

      }
      else {
        tripCount[driverId] += 1;
        driverBilledAmount[driverId] += eachTrip['billedAmount'];
        
      }
    })

    let maxTrip = 0;
    let maxBilled = 0;
    for (let driverId in tripCount) {
      if (tripCount[driverId] > maxTrip) {
        maxTrip = tripCount[driverId];
      
      }
      if (driverBilledAmount[driverId] > maxBilled) {
        maxBilled = driverBilledAmount[driverId]
      }
    }

    //pushing all pending promises in an array
    const driverResponse = [];
    for (let driver in tripCount) {
      
      driverResponse.push(getDriver(driver));
    }

    //getting an array of all driver IDs without duplicates
    const driverIDs = Object.keys(tripCount);
    

    const driverSettledPromises = await Promise.allSettled(driverResponse);

    //getting drivers with highest trips, earnings and multiple cars from settled Promises
    
    for (let i = 0; i < driverSettledPromises.length; i++) {
      const driverInfo = driverSettledPromises[i];
      console.log(driverInfo)
      const driver = driverIDs[i];

      if (driverInfo['status'] === 'rejected') {
        continue;
      }
      
      
      if (!mostTripsByDriver['name'] && tripCount[driver] === maxTrip) {
        
        mostTripsByDriver['name'] = driverInfo['value']['name'];
        mostTripsByDriver['email'] = driverInfo['value']['email'];
        mostTripsByDriver['phone'] = driverInfo['value']['phone'];
        mostTripsByDriver['noOfTrips'] = tripCount[driver];
        mostTripsByDriver['totalAmountEarned'] = Number(driverBilledAmount[driver].toFixed(2));
        
      }
      if (driverBilledAmount[driver] === maxBilled) {
        highestEarningDriver['name'] = driverInfo['value']['name'];
        highestEarningDriver['email'] = driverInfo['value']['email'];
        highestEarningDriver['phone'] = driverInfo['value']['phone'];
        highestEarningDriver['noOfTrips'] = tripCount[driver];
        highestEarningDriver['totalAmountEarned'] = Number(driverBilledAmount[driver].toFixed(2));
        console.log(driverInfo.value)
      }
      if (driverInfo['status'] === 'fulfilled' && driverInfo['value']['vehicleID'].length > 1) {
        driversWithMultiplyCars++
      }
    }


    result['noOfCashTrips'] = noOfCashTrips;
    result['noOfNonCashTrips'] = noOfNonCashTrips;
    result['billedTotal'] = Number(billedTotal.toFixed(2));
    result['cashBilledTotal'] = Number(cashBilledTotal.toFixed(2));
    result['nonCashBilledTotal'] = Number(nonCashBilledTotal.toFixed(2));
    result['noOfDriversWithMoreThanOneVehicle'] = driversWithMultiplyCars;
    result['mostTripsByDriver'] = mostTripsByDriver;
    result['highestEarningDriver'] = highestEarningDriver;

    return result;
  }
  catch (err) {
    console.log({ error: err });
    throw err;
  }

}
 analysis();

module.exports = analysis;



