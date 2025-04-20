const express = require('express');
const sequelize = require('./src/models');
const userRoutes = require('./src/routes/userRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


app.get('/', (req, res) => {
    res.send('Welcome to the User API');
});


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api/users', userRoutes);

app.use((req, res) => {
    res.status(404).send('Route not found');
});

require('./src/workers/userConsumer');

sequelize.sync().then(() => {
    console.log('MySQL DB connected');
    app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
}).catch(err => {
    console.error('Unable to connect to the DB:', err.message);
});