const express = require('express');
const app = express();
const port = 3010 || process.env.PORT;
const bodyParser = require('body-parser');
const Routers = require("../src/routes/message.routes")

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/zapbo", Routers);


app.listen(port, () => {
    console.log(`app rodando na porta: http://localhost:${port}/api`);
});

