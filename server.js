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

app.get('/todos', (req, res) => {
    res.send('Récupère les items');
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



const PORT = 3000;
// Lance le serveur et affiche un message dans la console
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});