const { getTrips, getDriver, getVehicle } = require('./node_modules/api/index');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  // Your code goes here
  try {
    const tripsResponse = await getTrips();
   // console.log(tripsResponse)
    const driverIdsArray = tripsResponse.map(object => {
      return object.driverID;
      
    })
    

    //getting unique drversID
    const uniqueDriversIds = [...new Set(driverIdsArray)];

    const result = [];

    const createUser = (trip) => {
       return {
        user: trip['user']['name'],
        created: trip['created'],
        pickup: trip['pickup']['address'],
        destination: trip['destination']['address'],
        billed: parseFloat(String(trip['billedAmount']).replace(/,/g, '')),
        isCash: trip['isCash']
      };
    }

    const vehicleDetails = (id, index) => {
      return {
        plate: id[index]['value']['plate'],
        manufacturer: id[index]['value']['manufacturer']
      }
      
    }


    for (let i = 0; i < uniqueDriversIds.length; i++) {
      const driverReport = {};
      let driverResponse = getDriver(uniqueDriversIds[i]);
      driverResponse = await Promise.allSettled([driverResponse])
    
      driverResponse = driverResponse[0]
      //console.log(driverResponse)
      
      //populating the driverReport {}
      if (driverResponse['status'] === 'fulfilled') {
        driverReport['fullName'] = driverResponse['value']['name'];
        driverReport['phone'] = driverResponse['value']['phone'];
      }
      driverReport['id'] = uniqueDriversIds[i];
      driverReport['vehicles'] = [];
      driverReport['noOfTrips'] = 0;
      driverReport['noOfCashTrips'] = 0;
      driverReport['noOfNonCashTrips'] = 0;
      driverReport['trips'] = [],
      driverReport['totalAmountEarned'] = 0,
      driverReport['totalCashAmount'] = 0,
      driverReport['totalNonCashAmount'] = 0
      
      //skipping the driver not found
      if (driverResponse['status'] === 'rejected') {
        continue;
      }
      //getting all the vehicle ids belonging to a driver
      let vehiclesIdsArr = driverResponse['value']['vehicleID'];
      let resVehicle;
console.log(vehiclesIdsArr)
      if (vehiclesIdsArr.length > 1) {
        resVehicle = vehiclesIdsArr.map((id) => getVehicle(id));
        resVehicle = await Promise.allSettled(resVehicle);
        //console.log(resVehicle)

        for (let i = 0; i < vehiclesIdsArr.length; i++) {
          driverReport['vehicles'].push(vehicleDetails(resVehicle, i));
        }
      } else {
        let i = 0;
        resVehicle = getVehicle(...vehiclesIdsArr);
        resVehicle = await Promise.allSettled([resVehicle]);
        driverReport['vehicles'].push(vehicleDetails(resVehicle, i))
      }
      
      for (let tripDetails of tripsResponse) {
        if (uniqueDriversIds[i] === tripDetails['driverID']) {
          driverReport['noOfTrips']++;
          driverReport['trips'].push(createUser(tripDetails));
          const billedAmount = driverReport['totalAmountEarned'] + parseFloat(String(tripDetails['billedAmount']).replace(/,/g, ''));
          driverReport['totalAmountEarned'] = Number(billedAmount.toFixed(2));

          if (tripDetails['isCash'] === true) {
            driverReport['noOfCashTrips']++;
            const billedAmount = driverReport['totalCashAmount'] + parseFloat(String(tripDetails['billedAmount']).replace(/,/g, ''));
            driverReport['totalCashAmount'] = Number(billedAmount.toFixed(2));
          } else {
            driverReport['noOfNonCashTrips']++;
            const billedAmount = driverReport['totalNonCashAmount'] + parseFloat(String(tripDetails['billedAmount']).replace(/,/g, ''));
            driverReport.totalNonCashAmount = Number(billedAmount.toFixed(2));
          }
        }
      }
      result.push(driverReport);
    }
   // console.log(result);
    return result;
  } catch (err) {
    throw err;
  }

}
driverReport()

module.exports = driverReport;