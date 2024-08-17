const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jahid12.81vfswo.mongodb.net/?retryWrites=true&w=majority&appName=jahid12`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const Product = client.db('ph-task').collection('product');

        app.get('/products', async (req, res) => {

            const { page = 1, limit = 12, search, brand, category, minPrice, maxPrice, sortBy, sortByDate } = req.query;

            let filter = {};
            if (search) {
                filter.name = { $regex: search, $options: 'i' };
            }

            if (brand) filter.brand = brand;
            if (category) filter.category = category;

            // Price range filtering
            const MinPrice = Number(minPrice);
            const MaxPrice = Number(maxPrice);
            if (MinPrice || MaxPrice) {
                filter.price = {
                    $gte: MinPrice,
                    $lte: MaxPrice,
                };
            }

            try {
                const products = await Product.find(filter).limit(parseInt(limit)).skip((page - 1) * parseInt(limit)).toArray();
                const count = await Product.countDocuments(filter); // Count total products
                res.send({ products, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })

        // Connect the client to the server
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
