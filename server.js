import express from 'express';
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/query', (req, res) => {
  const { prompt } = req.body;
  res.json({ response: "This is a mock response to: " + prompt });
});

app.listen(3000, () => console.log('Server running on port 3000'));