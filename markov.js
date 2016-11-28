var Chain = require('markov-chains').default;

// our states (an array of arrays) 
var states = [
  // week 1 
  [
    { temp: 'hot',  weather: 'sunny' },
    { temp: 'hot',  weather: 'cloudy' },
    { temp: 'warm', weather: 'cloudy' },
    { temp: 'warm', weather: 'cloudy' },
    { temp: 'warm', weather: 'rainy' },
    { temp: 'cool', weather: 'cloudy' },
    { temp: 'warm', weather: 'sunny' },
  ],

  // week 2 
  [
    { temp: 'warm', weather: 'sunny' },
    { temp: 'warm', weather: 'cloudy' },
    { temp: 'warm', weather: 'cloudy' },
    { temp: 'warm', weather: 'sunny' },
    { temp: 'hot',  weather: 'sunny' },
    { temp: 'hot',  weather: 'cloudy' },
    { temp: 'warm', weather: 'cloudy' },
  ],
 
  // etc. 
];
 
// build the chain 
var chain = new Chain(states);
 
// generate a forecast 
var forecast = chain.walk();
 
console.log(forecast);
 
// Example output: 
// 
// [ { temp: 'warm', weather: 'sunny' }, 
//   { temp: 'warm', weather: 'cloudy' }, 
//   { temp: 'warm', weather: 'rainy' }, 
//   { temp: 'cool', weather: 'cloudy' }, 
//   { temp: 'warm', weather: 'sunny' } ] 
