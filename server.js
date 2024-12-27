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
    },
    {
        userId: 3,
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        profilePictureUrl: "https://example.com/images/alice_johnson.jpg",
        totalDistanceRun: 300.0,
        totalRuns: 50,
        averagePace: 4.8,
        preferredUnit: "km"
    },
    {
        userId: 4,
        name: "Bob Brown",
        email: "bob.brown@example.com",
        profilePictureUrl: null,
        totalDistanceRun: 50.3,
        totalRuns: 10,
        averagePace: 5.5,
        preferredUnit: "miles"
    }
];

// GET all users
app.get('/users', (req, res) => {
    res.json(users);
});

// GET a user by email
app.get('/users/:email', (req, res) => {
    const { email } = req.params;
    const user = users.find(user => user.email === email);
    if (user) {
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

// UPDATE a user by email
app.put('/users/:email', (req, res) => {
    const { email } = req.params;
    const index = users.findIndex(user => user.email === email);
    if (index !== -1) {
        users[index] = { ...users[index], ...req.body }; // Merge existing and new data
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
// GET all runs, regardless of email
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

// POST a new run for a specific email
app.post('/runs/:email', (req, res) => {
    const { email } = req.params;
    const newRun = {
        id: runs.length > 0 ? runs[runs.length - 1].id + 1 : 12345, // Ensure unique id
        _id: req.body._id && req.body._id !== "N/A" ? req.body._id : `id-${Date.now()}`, // Use provided _id or generate one
        email: req.body.email || email, // Use email from request body, otherwise from the URL
        ...req.body,
        dateRan: req.body.dateRan || new Date().toISOString() // Use provided or current date
    };
    runs.push(newRun);
    res.status(201).json(newRun);
});

// UPDATE a run by email and id
app.put('/runs/:email/:id', (req, res) => {
    const { email, id } = req.params;
    const index = runs.findIndex(run => run.email === email && run._id === id);
    if (index !== -1) {
        runs[index] = { ...runs[index], ...req.body }; // Merge existing and new data
        res.json(runs[index]); // Return updated run
    } else {
        res.status(404).send('Run not found');
    }
});

// DELETE a run by email and id
app.delete('/runs/:email/:id', (req, res) => {
    const { email, id } = req.params;
    const index = runs.findIndex(run => run.email === email && run._id === id);
    if (index !== -1) {
        const [deletedRun] = runs.splice(index, 1); // Destructure to get the object
        res.json(deletedRun); // Return the object directly
    } else {
        res.status(404).send('Run not found');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
