const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const axios = require('axios'); 


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads') 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({ storage: storage });

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};
router.get('/login', (req, res) => {
    res.render('login', { message: false });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.render('login', { message: "user not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { message: "password is incorrect" });
        }

        req.session.user = user;
        
        if (req.session.user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { errorMessage: 'Internal Server Error' });
    }
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup', { message: false });
});

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.render('signup', { message: "user already exists" });
        }
        if (password.length < 6 ) {
            return res.render('signup', { message: "password must be at least 6 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.render('login', { message: "user created successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { errorMessage: 'Internal Server Error' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/mainPage');
});

router.get('/', (req, res) => {
    res.redirect('/mainPage');
});

router.get('/mainPage', async (req, res) => {
    try {
        const apiKey = '8sRU2v2QZRP1KlDDaD0hm8j0sDQHQO2vrwnf8gxb';

        const today = new Date();
        const dates = [];
        for (let i = 1; i <= 6; i++) {
            const previousDate = new Date(today);
            previousDate.setDate(today.getDate() - i);
            dates.push(previousDate.toISOString().split('T')[0]); // Get date in format YYYY-MM-DD
        }

        // Fetch Astronomy Photo of the Day for each of the previous 6 days
        const apodPromises = dates.map(date =>
            axios.get(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${apiKey}`)
        );

        // Wait for all API requests to complete
        const responses = await Promise.all(apodPromises);

        // Extract the APOD data from each response
        const apods = responses.map(response => response.data);

        if (req.session.user) {
            res.render('mainPage', { user: req.session.user, apods: apods });
        } else {
            res.render('mainPage', { user: "notUser", apods: apods });
        }
    } catch (error) {
        console.error('Error fetching APOD:', error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/admin', isAuthenticated, async (req, res) => {
    if (req.session.user.role === 'admin') {
        try {
            const users = await User.db.collection('users').find().toArray();
            const items = await Item.find();
            // const users = await User.find({});
            // console.log(users);
            res.render('admin', { users: users, user: req.session.user, items: items});
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/mainPage');
    }
});



router.post('/addUser', async (req, res) => {
    const { username, password, role } = req.body; 
    // console.log(username, password, role);
    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, role, createdAt: new Date(), updatedAt: new Date()});

        await newUser.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/deleteUser/:userId', isAuthenticated, async (req, res) => {
    const userId = req.params.userId;

    try {
        await User.db.collection('users').deleteOne({ _id: new ObjectId(userId)});

        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/editUser',  isAuthenticated, async (req, res) => {
    const userId = req.body.userId;
    const updatedUsername = req.body.username;
    const updatedRole = req.body.role;
    const updatedTime = Date.now();

    try {
        await User.db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { username: updatedUsername, role: updatedRole, updatedAt: updatedTime } });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }

});


router.post('/admin/add-item', upload.array('pictures', 3), async (req, res) => {
    try {
        const { nameEnglish, nameRussian, descriptionEnglish, descriptionRussian } = req.body;
        const pictures = req.files.map(file => file.path);

        const newItem = new Item({
            pictures: pictures,
            names: {
                english: nameEnglish,
                russian: nameRussian
            },
            descriptions: {
                english: descriptionEnglish,
                russian: descriptionRussian
            }
        });

        await newItem.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).send('Error adding item');
    }
});

router.delete('/deleteItem/:itemId', isAuthenticated, async (req, res) => {
    const itemId = req.params.itemId;

    try {
        await Item.findByIdAndDelete(itemId);

        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/editItem', upload.array('newItemImages', 3), async (req, res) => {
    try {
        const { itemId, itemName, itemRussianName, itemDescriptionEnglish, itemDescriptionRussian } = req.body;
        const newPictures = req.files.map(file => file.path);

        const updatedItem = await Item.findByIdAndUpdate(itemId, {
            $set: {
                'names.english': itemName,
                'names.russian': itemRussianName,
                'descriptions.english': itemDescriptionEnglish,
                'descriptions.russian': itemDescriptionRussian,
                $push: { pictures: { $each: newPictures } }
            }
        }, { new: true });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error editing item:', error);
        res.status(500).send('Error editing item');
    }
});



router.get('/account', isAuthenticated, (req, res) => {
    res.render('account', { user: req.session.user, message: false});
});


router.put('/change-user-data', isAuthenticated, async (req, res) => {
    const { username } = req.body;
    const user = await User.findByIdAndUpdate(req.session.user._id, { username }, { new: true });
    req.session.user = user;
    res.render('account', { user: req.session.user, message: false });
});


router.put('/change-password', isAuthenticated, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    // console.log(oldPassword);
    // console.log(newPassword);
    // console.log(req.session.user.password);
    const isMatch = await bcrypt.compare(oldPassword, req.session.user.password);

    if (!isMatch) {
        return res.render('account', { user: req.session.user, message: 'password is incorrect'});
    }
    newPass = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.session.user._id, { password: newPass }, { new: true });
    req.session.user = user;
    res.render('account', { user: req.session.user });
});



router.get('/nasa_news', async (req, res) => {
    try {
        const apiKey = 'ea350dec87474ac890206d04545305b3';
        const theme = 'nasa';
        const apiUrl = `https://newsapi.org/v2/everything?q=${theme}&apiKey=${apiKey}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.articles) {
            const articlesWithImages = data.articles.filter(article => article.urlToImage !== null);
            
            const first10ArticlesWithImages = articlesWithImages.slice(0, 10);

            if (first10ArticlesWithImages.length > 0) {
                if (req.session.user) {
                    res.render('nasaNews', { articles: first10ArticlesWithImages, user: req.session.user});
                } else {
                    res.render('nasaNews', { articles: first10ArticlesWithImages, user: "notUser"});
                }
            } else {
                res.status(404).json({ message: 'No articles with images found' });
            }
        } else {
            res.status(404).json({ message: 'No articles' });
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

module.exports = router;




/*

router.post('/weather', isAuthenticated, async (req, res) => {
    const { city } = req.body;
    
    const apiKey = '7445e570dcfb27be27f536a55fe702f4';
    const currentWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;


    try {
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        
        let lat = currentWeatherData.coord.lat;
        let lon = currentWeatherData.coord.lon;


        const timezoneUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=KJD9DK60HXSW&format=json&by=position&lat=${lat}&lng=${lon}`
        const timezoneResponse = await fetch(timezoneUrl);
        const timezoneData = await timezoneResponse.json();

        const wikipediaUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`;
        const wikipediaResponse = await fetch(wikipediaUrl);
        const wikipediaData = await wikipediaResponse.json();
        let cityInfo = '';

        if (wikipediaData.extract) {
            const sentences = wikipediaData.extract.split('.').slice(0, 5);
            cityInfo = sentences.join('.') + '.';
        }

        let date = new Date();
        let day = date.getDate();
        let monthIndex = date.getMonth();
        let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let month = monthNames[monthIndex];
        let hours = date.getHours();
        let minutes = date.getMinutes();
        day = (day < 10 ? '0' : '') + day;
        hours = (hours < 10 ? '0' : '') + hours;
        minutes = (minutes < 10 ? '0' : '') + minutes;
        let formattedDate = day + ' ' + month + ' ' + hours + ':' + minutes;


        const responseData = {
            city: city,
            currentWeather: currentWeatherData,
            forecast: forecastData,
            timezone: timezoneData,
            timestamp: formattedDate,
            cityInfo: cityInfo
        };

        const user = req.session.user;
        user.history.push(responseData);
        User.db.collection('weather').insertOne(
            {
                username: user._id,
                city: city,
                currentWeather: currentWeatherData,
                forecast: forecastData,
                timezone: timezoneData,
                timestamp: formattedDate,
                cityInfo: cityInfo
            }
        );
        await User.findByIdAndUpdate(user._id, { history: user.history }, { new: true });

        const coordinates = {
            lat: currentWeatherData.coord.lat,
            lon: currentWeatherData.coord.lon
        };
        res.render('script', { weatherData: responseData, coordinates });
       
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
});



router.get('/weather/:cardId', isAuthenticated, async (req, res) => {
    const cardId = req.params.cardId;
    const history = req.session.user.history;

    res.render('script', { weatherData: history[cardId] });

});
*/