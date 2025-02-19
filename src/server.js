const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');

const authUserRouter = require('./routes/userRoutes');

//

app.use(express.json());
app.use(cors());

app.use('/api', authUserRouter);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});