const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const app = express();
const ig = new IgApiClient();

app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

// Set up EJS
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index'); // Render index.ejs
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    ig.state.generateDevice(username);

    try {
        await ig.simulate.preLoginFlow();
        const loggedInUser = await ig.account.login(username, password);
        const userProfile = await ig.user.infoByUsername('username_to_scrape');
        console.log(userProfile);
        res.send('Login successful');
    } catch (err) {
        if (err instanceof IgCheckpointError) {
            console.log('Checkpoint required. Sending code...');
            await ig.challenge.auto(true); // This will send a code to the user
            // Here you'll need to define how to get the code from the user.
            const code = await getCodeFromUserSomehow();
            console.log('Submitting code...');
            const response = await ig.challenge.sendSecurityCode(code);
            console.log('Logged in');
            res.send('Login successful');
        } else {
            console.error(err);
            res.send('Error logging in');
        }
    }
});


app.listen(3000, () => console.log('App listening on port 3000!'));
