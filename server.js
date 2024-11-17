const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // for a unique id generate
const app = express();
const Joi = require('joi');

let data = [
    {
        'id': '1',
        'companyName': 'abc',
        'industryName': 'xyz',
        'jobTitle': 'Frontend Dev',
        'jobType': 'ux',
        'submissionDate': '2024-03-05',
        'applicationUrl': 'qpwoe',
        'confidenceScore': 'low',
        'status': 'applied'
    },
    {
        'id': '2',
        'companyName': 'abc',
        'industryName': 'xyz',
        'jobTitle': 'Frontend Dev',
        'jobType': 'ux',
        'submissionDate': '2023-06-05',
        'applicationUrl': 'qpwoe',
        'confidenceScore': 'medium',
        'status': 'applied'
    },
    {
        'id': '3',
        'companyName': 'abc',
        'industryName': 'xyz',
        'jobTitle': 'Frontend Dev',
        'jobType': 'ux',
        'submissionDate': '2020-10-03',
        'applicationUrl': 'qpwoe',
        'confidenceScore': 'high',
        'status': 'applied'
    }
]

//tells Express to serve all static files (like CSS, JavaScript, and other HTML files) from the src directory.  
app.use(express.static('src'));
app.use(express.static('public')); 

//to let express know you are using json
app.use(express.json());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

//the home address
app.get('/', (req, res)=>{
    //sends the index.html file as the response
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Serve index.html for all other routes
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'src', 'index.html'));
// });

app.get('/applications', (req, res)=>{
    //when we have a query
    const { search } = req.query;
    let filteredData = data;

    if (search) {
        const searchLower = search.toLowerCase();
        filteredData = data.filter(app => 
            app.companyName.toLowerCase().includes(searchLower) ||
            app.jobTitle.toLowerCase().includes(searchLower)
        );
    }

    res.status(200).json(filteredData);
});

app.get('/applications/:id', (req, res)=>{
    const {id} = req.params;
    const application = data.find(app => app.id === id);
    if (application) {
        res.status(200).json(application);
    } else {
        res.status(404).send('Application not found');
    }
});

app.put('/applications/:id', (req, res)=>{
    const {id} = req.params;
    const updatedFields = req.body;
    const application = data.find(app => app.id === id);
    if (application) {
        Object.assign(application, updatedFields);
        res.status(200).json(application);
    } else {
        res.status(404).send('Application not found');
    }
});

app.post('/applications', (req, res)=>{
    const item = req.body;
    if(!item){//
        res.status(400).send('Application invalid');
    }
    else{
        item.id = uuidv4(); // Generate a unique ID
        item.status = 'applied';
        data.push(item);
        res.status(201).json(data);
    }
})

app.delete('/applications/:id', (req, res) => {
    const { id } = req.params;
    const index = data.findIndex(app => app.id === id);
    if (index !== -1) {
        data.splice(index, 1);
        res.status(204).send('Application deleted');
    } else {
        res.status(404).send('Application not found');
    }
});

//telling the server to run on this port for any api requests
const PORT = process.env.PORT || 3000;
app.listen(3000, ()=>{
    console.log("Server is listening on port 3000");
})