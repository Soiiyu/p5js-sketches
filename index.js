const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Define the base directory where your p5.js sketch folders are located
const baseDirectory = path.join(__dirname, 'projects');

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

// Start the server
const port = 3000; // Set the port number you want to use
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
