const express = require('express');

const app = express();

app.get('/', (_, res) => {
	res.sendFile('./index.html', { root: __dirname });
});

app.get('/scripts.js', (_, res) => {
	res.sendFile('./scripts.js', { root: __dirname });
});

app.get('/styles.css', (_, res) => {
	res.sendFile('./styles.css', { root: __dirname });
});

app.get('/Rhett-logo.svg', (_, res) => {
	res.sendFile('./Rhett-logo.svg', { root: __dirname });
});

app.listen(3000, () => console.log('App listening on port 3000'));
