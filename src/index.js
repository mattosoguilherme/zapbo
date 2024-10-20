const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');
const Routers = require("../src/routes/message.routes")
const YAML = require('yamljs');
const swagger = require('swagger-ui-express');
const path = require('path');
const { log } = require('console');
const teste = path.join(__dirname, '../src/swagger.yaml');
log(teste)
const swaggerDocument = YAML.load(teste);


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", Routers);
app.use("/api", swagger.serve, swagger.setup(swaggerDocument))


app.listen(port, () => {
    console.log(`app rodando na porta: http://localhost:${port}/api`);
});

