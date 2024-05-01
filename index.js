const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// const cors = require('cors')
const fs = require('fs');
const path = require('path');

const config = require('./config.json')

const app = express();

// Define the base directory where your p5.js sketch folders are located
const baseDirectory = path.join(__dirname, 'projects');

// app.use(cors());
app.use(express.json())

// Serve the directory page when accessing the root URL
app.get('/', (req, res) => {
    // Read the list of project folders
    fs.readdir(baseDirectory, (err, folders) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            // Generate links for each project folder
            const projectLinks = folders.map((folder) => {
                const folderPath = path.join('/', folder);
                return `<li><a href="${folderPath}">${folder}</a></li>`;
            });

            // Create an HTML response with the project links
            const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>P5 Projects Directory</title>
        </head>
        <body>
          <h1>P5 Projects Directory</h1>
          <ul>
            ${projectLinks.join('\n')}
          </ul>
        </body>
        </html>
      `;

            // Send the HTML response
            res.send(htmlResponse);
        }
    });
});

// Serve directory listings for subdirectories
app.use(express.static(baseDirectory, { extensions: ['html'] }));

// For fetching and parsing osu! scores from https://osu.ppy.sh/scores/osu/<score-id> urls
app.post('/fetchScore', async (req, res) => {
    const { type, data } = req.body
    console.log(`fetching ${type} ${data}`)
    try {
        if (type == 'score') {
            // data contains score url
            const score = await fetch(data).then(res => res.text())
            console.log('loaded score')
            const scoreJSON = JSON.parse(score.match(/<script id="json-show" type="application\/json">([\s\S]+?)<\/script>/m)[1].trim())
            
            res.json({ status: 'success', score: scoreJSON })
            console.log('Successfully fetched score!')
        } else if (type == 'player') {
            // data contains player id
            const user = await fetch(`https://osu.ppy.sh/api/get_user?k=${config.api_key}&u=${data}`).then(res => res.json())

            const rank = user[0].pp_rank
            const totalpp = user[0].pp_raw

            // console.log(rank, totalpp)

            res.json({ status: 'success', rank, totalpp })
            console.log(`Successfully parsed rank ${rank} and ${totalpp}pp`)
        }
    } catch (error) {
        res.json({ status: 'error', error })
    }
})

app.post('/fetchScoreTesting', (req, res) => {
    const score = JSON.parse(fs.readFileSync('./temp_score.json', 'utf-8'))
    console.log('sending')
    res.json({ score })
})

// Start the server
const port = 3000; // Set the port number you want to use
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
