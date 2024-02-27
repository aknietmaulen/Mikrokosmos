const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const APOD = require('../models/apod');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const multer = require('multer');
const session = require('express-session');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads') 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({ storage: storage });

router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

router.get('/', (req, res) => {
    res.redirect('/mainPage');
});

router.get('/mainPage', async (req, res) => {
    try {
        const items = await Item.find(); // Fetch items from the database
        res.render('mainPage', { user: req.session.user, items: items }); // Pass items to the template rendering
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/login', (req, res) => {
    res.render('login', { message: false });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.render('login', { message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { message: "Password is incorrect" });
        }

        req.session.user = user;
        
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/mainPage');
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
    res.redirect('/login');
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


router.post('/editUser', isAuthenticated, async (req, res) => {
    const { userId, username, role } = req.body; // Destructure userId, username, and role

    try {
        // Validate userId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid userId');
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(userId, {
            username,
            role
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        return res.redirect('/admin'); // Redirect after updating user
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/editUser', isAuthenticated, async (req, res) => {
    const { userId, username, role } = req.body; // Destructure userId, username, and role

    try {
        // Validate userId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid userId');
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(userId, {
            username,
            role
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        return res.redirect('/admin'); // Redirect after updating user
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/addUser', async (req, res) => {
    const { username, password, role } = req.body; 

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            role, 
            createdAt: new Date(),
            updatedAt: new Date()
        });

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

router.post('/editItem', upload.array('newItemImages', 3), async (req, res) => {
    try {
        const { itemId, itemNameEnglish, itemNameRussian, itemDescriptionEnglish, itemDescriptionRussian } = req.body;
        const newPictures = req.files.map(file => file.path);

        const updatedItem = await Item.findByIdAndUpdate(itemId, {
            $set: {
                'names.english': itemNameEnglish,
                'names.russian': itemNameRussian,
                'descriptions.english': itemDescriptionEnglish,
                'descriptions.russian': itemDescriptionRussian,
                $push: { pictures: { $each: newPictures } }
            }
        },{ new: true });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error editing item:', error);
        res.status(500).send('Error editing item');
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


router.get('/history', isAuthenticated, async (req, res) => {
    const user = req.session.user;
    const apodHistory = await APOD.find({ userId: req.session.user._id }).sort({ date: -1 });
    res.render('history', { user: user, apodHistory: apodHistory });
});

router.get('/apod', isAuthenticated, async (req, res) => {
    try {
        let date = req.query.date;

        if (!date || date === 'today') {
            date = new Date().toISOString().split('T')[0]; 
        }

        const apiKey = '8sRU2v2QZRP1KlDDaD0hm8j0sDQHQO2vrwnf8gxb';
        const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;

        const response = await fetch(apodUrl);
        const apodData = await response.json();

        if (req.session.user) {
            const apod = new APOD({
                userId: req.session.user._id,
                title: apodData.title,
                date: date,
                apodData: apodData
            });
            await apod.save();
        }

        res.render('apod', { apodData: apodData, user: req.session.user });
    } catch (error) {
        console.error('Error fetching Astronomy Picture of the Day:', error);
        res.status(500).send('Error fetching Astronomy Picture of the Day');
    }
});

router.get('/nasa_news', isAuthenticated, async (req, res) => {
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
