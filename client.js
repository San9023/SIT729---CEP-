const mqtt = require('mqtt')
const moment = require('moment');

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// const mqtt = require('mqtt');
// const client = mqtt.connect('mqtt://mqtt-broker-url'); 

client.on('connect', () => {
  console.log('MQTT connected');


  // Subscribe to all drone messages
  client.subscribe('drones/#', (err) => {
    if (!err) {
      console.log('Subscribed to all Drone Msg');
    } else {
      console.error('Subscription error', err);
    }
  });

  // Subscribe to the Speeds of Short distance drones
  client.subscribe('drones/short-distance/+/speed', (err) => {
    if (!err) {
      console.log('Subscribed to Speeds of Short distance drones');
    } else {
      console.error('Subscription error', err);
    }
  });

  // Subscribe to the battery levels of all drones
  client.subscribe('drones/+/battery', (err) => {
    if (!err) {
      console.log('Subscribed to battery levels of all drones');
    } else {
      console.error('Subscription error', err);
    }
  });

  // Subscribe to the latitude and longitude values of all Long distance drones
  client.subscribe('drones/long-distance/+/lat&long', (err) => {
    if (!err) {
      console.log('Subscribed to latitude and longitude values of Long distance drones');
    } else {
      console.error('Subscription error', err);
    }
  });

});

// Handle incoming messages
client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
});
