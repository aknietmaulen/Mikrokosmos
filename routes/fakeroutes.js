// const express = require('express');
// const router = express.Router();
// const User = require('../models/user');
// const bcrypt = require('bcrypt');
// const { MongoClient, ObjectId } = require('mongodb');


// router.get('/', (req, res) => {
//     res.redirect('/main');
// });

// const isAuthenticated = (req, res, next) => {
//     if (req.session.user) {
//         next();
//     } else {
//         res.redirect('/login');
//     }
// };

// const isAdmin = (req, res, next) => {
//     if (req.session.user && req.session.user.role === 'admin') {
//         next();
//     } else {
//         res.status(403).send('Forbidden'); 
//     }
// };

// router.get('/login', (req, res) => {
//     res.render('login', { message: false });
// });


// router.get('/admin', isAdmin, async (req, res) => {
//     try {
//         const users = await User.find({});
//         res.render('admin', { users });
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// // router.get('/admin', async (req, res) => {
// //     try {
// //         const users = await User.find({});
// //         res.render('admin', { users });
// //     } catch (error) {
// //         console.error('Error fetching users:', error);
// //         res.status(500).send('Internal Server Error');
// //     }
// // });


// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const user = await User.findOne({ username });

//         if (!user) {
//             return res.status(400).send({ message: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);

//         if (isMatch) {
//             // check if the user is 'akniet', if so, set their role as 'admin'
//             const role = (username === 'akniet' && password === '123') ? 'admin' : 'regular';
            
//             req.session.user = { ...user.toObject(), role }; 
//             if (role === 'admin') {
//                 res.redirect('/admin');
//                 return; 
//             } else{
//                 req.session.user = user;
//                 res.redirect('/main');
//             }
//         } else {
//             return res.status(400).send({ message: 'Incorrect password' });
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });



// router.get('/signup', (req, res) => {
//     res.render('signup');
// });

// router.post('/signup', async (req, res) => {
//     const { username, password } = req.body;

//     const role = (username === 'akniet' && password === '123') ? 'admin' : 'regular';

//     const existingUser = await User.findOne({ username });

//     if (existingUser) {
//         return res.status(400).send({ message: 'A user with such username already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({ username, password: hashedPassword, role }); 

//     await user.save();
    
//     res.render('login', { message: true});
// });


// router.post('/logout', (req, res) => {
//     req.session.destroy();
//     res.redirect('/login');
// });


// router.get('/main', async (req, res) => {
//     if (!req.session.user) {
//         res.render('mainPage', { user: false });
//     } else {
//         try {
//             const userid = req.session.user._id;
//             let his = await User.db.collection('weather').find({ username: userid }).toArray();
//             console.log(his);
//             console.log(typeof his);
//             res.render('mainPage', { user: his });
//         } catch (error) {
//             console.error('Error fetching history:', error);
//             res.status(500).send('Internal Server Error');
//         }
//     }
// });

// router.post('/weather', isAuthenticated, async (req, res) => {
//     const { city } = req.body;
    
//     const apiKey = '7445e570dcfb27be27f536a55fe702f4';
//     const currentWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

//     const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;


//     try {
//         const currentWeatherResponse = await fetch(currentWeatherUrl);
//         const currentWeatherData = await currentWeatherResponse.json();

//         const forecastResponse = await fetch(forecastUrl);
//         const forecastData = await forecastResponse.json();
        
//         let lat = currentWeatherData.coord.lat;
//         let lon = currentWeatherData.coord.lon;


//         const timezoneUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=KJD9DK60HXSW&format=json&by=position&lat=${lat}&lng=${lon}`
//         const timezoneResponse = await fetch(timezoneUrl);
//         const timezoneData = await timezoneResponse.json();

//         const wikipediaUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`;
//         const wikipediaResponse = await fetch(wikipediaUrl);
//         const wikipediaData = await wikipediaResponse.json();
//         let cityInfo = '';

//         if (wikipediaData.extract) {
//             const sentences = wikipediaData.extract.split('.').slice(0, 5);
//             cityInfo = sentences.join('.') + '.';
//         }

//         let date = new Date();
//         let day = date.getDate();
//         let monthIndex = date.getMonth();
//         let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//         let month = monthNames[monthIndex];
//         let hours = date.getHours();
//         let minutes = date.getMinutes();
//         day = (day < 10 ? '0' : '') + day;
//         hours = (hours < 10 ? '0' : '') + hours;
//         minutes = (minutes < 10 ? '0' : '') + minutes;
//         let formattedDate = day + ' ' + month + ' ' + hours + ':' + minutes;


//         const responseData = {
//             city: city,
//             currentWeather: currentWeatherData,
//             forecast: forecastData,
//             timezone: timezoneData,
//             timestamp: formattedDate,
//             cityInfo: cityInfo
//         };

//         const user = req.session.user;
//         user.history.push(responseData);
//         User.db.collection('weather').insertOne(
//             {
//                 username: user._id,
//                 city: city,
//                 currentWeather: currentWeatherData,
//                 forecast: forecastData,
//                 timezone: timezoneData,
//                 timestamp: formattedDate,
//                 cityInfo: cityInfo
//             }
//         );
//         await User.findByIdAndUpdate(user._id, { history: user.history }, { new: true });

//         const coordinates = {
//             lat: currentWeatherData.coord.lat,
//             lon: currentWeatherData.coord.lon
//         };
//         res.render('script', { weatherData: responseData, coordinates });
       
//     } catch (error) {
//         console.error('Error fetching weather data:', error);
//     }
// });



// router.get('/weather/:cardId', isAuthenticated, async (req, res) => {
//     const cardId = req.params.cardId;
//     const history = req.session.user.history;

//     res.render('script', { weatherData: history[cardId] });

// });


// router.post('/admin/add-user', isAdmin, async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const existingUser = await User.findOne({ username });

//         if (existingUser) {
//             return res.status(400).send({ message: 'User already exists' });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = new User({ username, password: hashedPassword });

//         await newUser.save();

//         res.redirect('/admin');
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });



// router.post('/admin/delete-user', isAdmin, async (req, res) => {
//     try {
//         const userId = req.body.userId;

//         await User.findByIdAndDelete(userId);

//         res.redirect('/admin');
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// router.get('/admin/edit-user/:userId', isAdmin, async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const user = await User.findById(userId);
//         res.render('adminEditUser', { user });
//     } catch (error) {
//         console.error('Error fetching user for editing:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// // Modify the route for editing a user
// router.post('/admin/edit-user/:userId', isAdmin, async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const { username, password } = req.body;

//         // You can add validation logic here if needed

//         // Find the user by ID
//         const user = await User.findById(userId);

//         // Update user details
//         user.username = username;
//         user.password = await bcrypt.hash(password, 10);

//         // Save the updated user
//         await user.save();

//         // Redirect back to the admin page
//         res.redirect('/admin');
//     } catch (error) {
//         console.error('Error editing user:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// module.exports = router;
