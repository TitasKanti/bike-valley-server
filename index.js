const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d9ivi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        const database = client.db("explore");
        const bikesCollection = database.collection("bikes");
        const orderCollection = database.collection("orders");
        const usersCollection = database.collection("users");

        //GET API
        app.get('/bikes', async (req, res) => {
            const cursor = bikesCollection.find({});
            const bikes = await cursor.toArray();
            res.json(bikes);
        })

        //GET SPECIFIC API WITH ID
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const bike = await bikesCollection.findOne(query);
            res.json(bike);
        })

        //POST API TO GET DATA FROM CLIENT SITE AND SEND IT TO MONGODB
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.json(result);
        })

        //POST USERS API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        //UPSERT USER
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })


        //GET QUERY API ORDER
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })


        // DELETE API ORDER
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        //UPDATE API ORDER STATUS
        // app.put('/orders/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id)
        //     const updatedOrder = req.body;
        //     console.log(updatedOrder);
        //     const filter = { _id: id };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             status: updatedOrder
        //         }
        //     };
        //     const result = await orderCollection.updateOne(filter, updateDoc, options);
        //     res.json('result');
        // })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Bikes Portal!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})