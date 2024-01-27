// Importe le module Express
const express = require('express');
 // Importe AWS SDK
const AWS = require('aws-sdk');       
// Recupère les variable dans le .env
require('dotenv').config();

const app = express();
app.use(express.json());

//Configuurez AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
// Creer une instance de ma base de donnée
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Ajouter une route pour la racine '/'
app.get('/', (req, res) => {
  res.send('Bienvenue sur mon API de gestion des tasks !');
});

app.get('/todos', async (req, res) => {
    const params = {
        TableName : 'Todos',
    }
    try {
        const data = await dynamodb.scan(params).promise()
        res.send(data.Items)
    } catch (err) {
        res.status(500).send(err.toString());
    }
  });


  app.get('/todos/:id', async (req, res) => {
    const params = {
        TableName : 'Todos',
        Key:{
            'id': req.params.id
        }
    }
    try {
        const { Item } = await dynamodb.get(params).promise()
        if (!Item) return res.status(404).send('The todo is not found')
        res.send(Item);
    } catch (err) {
        res.status(500).send(err.toString());
    }
  });

app.put('/todos/:id', async (req, res) => {
    const updateKeys = Object.keys(req.body);
    if (updateKeys.length === 0) {
        return res.status(400).send('No field to update')
    }

    const params = {
        TableName: 'Todos',
        Key: {
            'id' : req.params.id
        },
        UpdateExpression: "set",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    };


    updateKeys.forEach((key, index) => {
        const attributeKey = `#attr${key}`;
        const attributeValue = `:value${key}`;
        params.UpdateExpression += ` ${attributeKey} = ${attributeValue}`;
        params.ExpressionAttributeNames[attributeKey] = key;
        params.ExpressionAttributeValues[attributeValue] = req.body[key];

        if (index < updateKeys.length - 1) {
            params.UpdateExpression += ",";
          }
    });

    try {
        const data = await dynamodb.update(params).promise();
        res.send(data.Attributes);
    } catch (err) {
        res.status(500).send(err.toString());
    }

});

app.post('/todos', async (req, res) => {
    const todo = {
        id: AWS.util.uuid.v4(),
        ...req.body
    };

    const params = {
        TableName : 'Todos',
        Item: todo
    };

    try {
        await dynamodb.put(params).promise()
        res.send(todo)
    } catch (err) {
        res.status(500).send('Aucun champ à mettre à jour .')
    }
});

app.delete('/todos/:id', async (req, res)=>{
    const params = {
        TableName: 'Todos',
        Key:{
            'id': req.params.id
        }
    };

    try {
        await dynamodb.delete(params).promise();
        res.send({ id: req.params.id })
    } catch {
        res.status(500).send(err.toString());
    }
})



const PORT = 3000;
// Lance le serveur et affiche un message dans la console
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});