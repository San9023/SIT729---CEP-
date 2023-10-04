const mqtt = require('mqtt');
const moment = require('moment');

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const droneStatus = {};

client.on('connect', () => {
  console.log('MQTT connected');

  // Function to publish random values for short-distance drones
  function publishRandomShortDistanceValues(droneName) {
    const battery = Math.random() * 100;
    const altitude = Math.random() * 1000;
    const speed = Math.random() * 50;
    const latitude = Math.random() * 90;
    const longitude = Math.random() * 180;

    // Store the drone status
    droneStatus[droneName] = {
      battery,
      altitude,
      speed,
      latitude,
      longitude,
      lastUpdateTime: moment(),
    };

    // // Publish drone data
    // client.publish(`drones/short-distance/${droneName}/battery`, battery.toString());
    // client.publish(`drones/short-distance/${droneName}/altitude`, altitude.toString());
    // client.publish(`drones/short-distance/${droneName}/speed`, speed.toString());
    // client.publish(`drones/short-distance/${droneName}/lat&long`, `${latitude},${longitude}`);

    // Check for low battery alert for all drones
    checkLowBatteryAlert();
  }

  // Function to publish random values for long-distance drones
  function publishRandomLongDistanceValues(droneName) {
    const battery = Math.random() * 100;
    const altitude = Math.random() * 5000;
    const speed = Math.random() * 100;
    const latitude = Math.random() * 90;
    const longitude = Math.random() * 180;

    // Store the drone status
    droneStatus[droneName] = {
      battery,
      altitude,
      speed,
      latitude,
      longitude,
      lastUpdateTime: moment(),
    };

    // Publish drone data
    // client.publish(`drones/long-distance/${droneName}/battery`, battery.toString());
    // client.publish(`drones/long-distance/${droneName}/altitude`, altitude.toString());
    // client.publish(`drones/long-distance/${droneName}/speed`, speed.toString());
    // client.publish(`drones/long-distance/${droneName}/lat&long`, `${latitude},${longitude}`);

    // Check for low battery alert for all drones
    checkLowBatteryAlert();
  }

  // Publish random values periodically for short-distance drones
  setInterval(() => publishRandomShortDistanceValues('drone1'), 5000); // Every 5 seconds
  setInterval(() => publishRandomShortDistanceValues('drone2'), 5000); // Every 5 seconds
  setInterval(() => publishRandomShortDistanceValues('drone3'), 5000); // Every 5 seconds

  // Publish random values periodically for long-distance drones
  setInterval(() => publishRandomLongDistanceValues('drone1'), 10000); // Every 10 seconds
  setInterval(() => publishRandomLongDistanceValues('drone2'), 10000); // Every 10 seconds
  setInterval(() => publishRandomLongDistanceValues('drone3'), 10000); // Every 10 seconds

  // Function to check for low battery alerts
  function checkLowBatteryAlert() {
    const lowBatteryDrones = Object.keys(droneStatus).filter(droneName => droneStatus[droneName].battery < 10);
  
    // 1: Publish an alert if more than two drones have low battery
    if (lowBatteryDrones.length > 2) {
      client.publish('drones/alerts', 'Alert: More than two drones have low battery');
      console.log('Alert: More than two drones have low battery');
    }
  }
  
  // check for stationary drones at high altitude alerts
  function checkStationaryHighAltitudeAlert(droneName, altitude) {
    const status = droneStatus[droneName];
    const { lastUpdateTime } = status;
    const currentTime = moment();
    const timeDiff = currentTime.diff(lastUpdateTime, 'minutes');
  
    // 2: Publish an alert if a drone has been stationary for more than 10 minutes at an altitude above 100
    if (altitude > 100 && timeDiff > 10) {
      client.publish(`drones/alerts/${droneName}`, `Stationary drone alert. Altitude: ${altitude}m`);
      console.log(`Stationary drone alert for ${droneName}. Altitude: ${altitude}m`);
    }
  }

  // Handle incoming messages and other MQTT logic as in the previous example.
  client.on('message', (topic, message) => {
    const topicSplits = topic.split('/');
    const droneName = topicSplits[1];
  
    if (topicSplits[2] === 'battery') {
      // Update battery level
      droneStatus[droneName].battery = parseFloat(message.toString());
      // Check for low battery alerts
      checkLowBatteryAlert();
    } else if (topicSplits[2] === 'altitude') {
      // Update altitude
      droneStatus[droneName].altitude = parseFloat(message.toString());
      // Check for stationary drones at high altitude alerts
      checkStationaryHighAltitudeAlert(droneName, droneStatus[droneName].altitude);
    } else if (topicSplits[2] === 'lat&long') {
      // Update last known location and time for the drone
      droneStatus[droneName].lastUpdateTime = moment();
      droneStatus[droneName].location = message.toString();
    }
  });


  // Subscribed to all  topics
  client.subscribe('drones/short-distance/+/battery');
  client.subscribe('drones/short-distance/+/altitude');
  client.subscribe('drones/long-distance/+/battery');
  client.subscribe('drones/long-distance/+/altitude');
  client.subscribe('drones/+/lat&long');
});
