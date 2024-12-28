const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Mock runs data matching your updated RunModel
let runs = Array.from({ length: 5 }, (_, i) => ({
    id: 12345 + i,
    _id: `12345${i}`,
    unitType: `metres`,
    distanceAmount: i,
    message: `Run ${i}`,
    dateRan: new Date().toISOString(),
    email: `runner${i}@example.com` // Add email field
}));

// Mock users data matching UserProfileModel
let users = [
    {
        userId: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        profilePictureUrl: "https://example.com/images/john_doe.jpg",
        totalDistanceRun: 150.5,
        totalRuns: 30,
        averagePace: 5.2,
        preferredUnit: "km"
    },
    {
        userId: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        profilePictureUrl: "https://example.com/images/jane_smith.jpg",
        totalDistanceRun: 200.7,
        totalRuns: 40,
        averagePace: 6.0,
        preferredUnit: "miles"
    }
];

// Function to calculate user statistics from their runs
function calculateUserStats(email) {
    // Filter the runs for the user by email
    const userRuns = runs.filter(run => run.email === email);

    const totalDistanceRun = userRuns.reduce((total, run) => total + run.distanceAmount, 0);
    const totalRuns = userRuns.length;
    
    // Average pace is calculated as total distance divided by total runs (simple example)
    const averagePace = totalRuns > 0 ? totalDistanceRun / totalRuns : 0;

    return {
        totalDistanceRun,
        totalRuns,
        averagePace
    };
}

// GET all users
app.get('/users', (req, res) => {
    res.json(users);
});

// GET a user by email with updated profile stats
app.get('/users/:email', (req, res) => {
    const { email } = req.params;
    const user = users.find(user => user.email === email);

    if (user) {
        // Recalculate user stats based on runs
        const stats = calculateUserStats(email);

        // Update user profile with calculated stats
        user.totalDistanceRun = stats.totalDistanceRun;
        user.totalRuns = stats.totalRuns;
        user.averagePace = stats.averagePace;

        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

// POST a new user
app.post('/users', (req, res) => {
    const newUser = {
        userId: users.length > 0 ? users[users.length - 1].userId + 1 : 1, // Auto-increment userId
        ...req.body,
        totalDistanceRun: req.body.totalDistanceRun || 0.0,
        totalRuns: req.body.totalRuns || 0,
        averagePace: req.body.averagePace || 0.0,
        preferredUnit: req.body.preferredUnit || "km"
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// UPDATE a user by email with recalculated stats
app.put('/users/:email', (req, res) => {
    const { email } = req.params;
    const index = users.findIndex(user => user.email === email);
    if (index !== -1) {
        // Recalculate user stats based on runs
        const stats = calculateUserStats(email);
        users[index] = { ...users[index], ...req.body, ...stats }; // Merge existing and new data
        res.json(users[index]);
    } else {
        res.status(404).send('User not found');
    }
});

// DELETE a user by email
app.delete('/users/:email', (req, res) => {
    const { email } = req.params;
    const index = users.findIndex(user => user.email === email);
    if (index !== -1) {
        const [deletedUser] = users.splice(index, 1); // Remove and return the deleted user
        res.json(deletedUser);
    } else {
        res.status(404).send('User not found');
    }
});

// Runs Endpoints
// GET all runs
app.get('/runs', (req, res) => {
    res.json(runs);
});

// GET all runs by email
app.get('/runs/:email', (req, res) => {
    const { email } = req.params;
    const userRuns = runs.filter(run => run.email === email);
    if (userRuns.length > 0) {
        res.json(userRuns);
    } else {
        res.status(404).send('No runs found for this email');
    }
});

// GET a single run by email and id
app.get('/runs/:email/:id', (req, res) => {
    const { email, id } = req.params;
    const run = runs.find(run => run.email === email && run._id === id);
    if (run) {
        res.json([run]); // Return the run as an array with a single element
    } else {
        res.status(404).send('Run not found');
    }
});

// POST a new run for a specific email and update user profile
app.post('/runs/:email', (req, res) => {
    const { email } = req.params;
    const newRun = {
        id: runs.length > 0 ? runs[runs.length - 1].id + 1 : 12345,
        _id: req.body._id && req.body._id !== "N/A" ? req.body._id : `id-${Date.now()}`,
        email: req.body.email || email,
        ...req.body,
        dateRan: req.body.dateRan || new Date().toISOString()
    };

    // Add the new run
    runs.push(newRun);

    // Recalculate the user stats after adding the new run
    const stats = calculateUserStats(email);
    const user = users.find(user => user.email === email);
    if (user) {
        user.totalDistanceRun = stats.totalDistanceRun;
        user.totalRuns = stats.totalRuns;
        user.averagePace = stats.averagePace;
        res.status(201).json(newRun);
    } else {
        res.status(404).send('User not found');
    }
});

// UPDATE a run by email and id and recalculate stats
app.put('/runs/:email/:id', (req, res) => {
    const { email, id } = req.params;
    const index = runs.findIndex(run => run.email === email && run._id === id);
    
    if (index !== -1) {
        // Update the run
        runs[index] = { ...runs[index], ...req.body };

        // Recalculate the user stats after updating the run
        const stats = calculateUserStats(email);
        const user = users.find(user => user.email === email);
        if (user) {
            user.totalDistanceRun = stats.totalDistanceRun;
            user.totalRuns = stats.totalRuns;
            user.averagePace = stats.averagePace;
            res.json(runs[index]);
        } else {
            res.status(404).send('User not found');
        }
    } else {
        res.status(404).send('Run not found');
    }
});

// DELETE a run by email and id and recalculate stats
app.delete('/runs/:email/:id', (req, res) => {
    const { email, id } = req.params;
    const index = runs.findIndex(run => run.email === email && run._id === id);

    if (index !== -1) {
        // Remove the run
        const [deletedRun] = runs.splice(index, 1);

        // Recalculate the user stats after deleting the run
        const stats = calculateUserStats(email);
        const user = users.find(user => user.email === email);
        if (user) {
            user.totalDistanceRun = stats.totalDistanceRun;
            user.totalRuns = stats.totalRuns;
            user.averagePace = stats.averagePace;
            res.json(deletedRun);
        } else {
            res.status(404).send('User not found');
        }
    } else {
        res.status(404).send('Run not found');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
