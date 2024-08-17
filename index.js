const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

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
            const {
                page = 1,
                limit = 12,
                search,
                brand,
                category,
                minPrice,
                maxPrice,
                sortBy,
                sortByDate
            } = req.query;

            let filter = {};
            // Search by product name (case-insensitive)
            if (search) {
                filter.name = { $regex: search, $options: 'i' };
            }

            // Filter by brand if provided
            if (brand) filter.brand = brand;

            // Filter by category if provided
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

            // Sorting Logic
            let sort = {};
            if (sortBy === 'priceAsc') sort.price = 1; // Sort by price Low to High
            else if (sortBy === 'priceDesc') sort.price = -1; // Sort by price High to Low
            if (sortByDate === 'dateDesc') sort.date = -1; // Sort by date Newest First

            try {
                const products = await Product.find(filter)
                    .sort(sort) // Apply sorting
                    .limit(parseInt(limit)) // Limit the number of results per page
                    .skip((page - 1) * parseInt(limit)) // Skip to the correct page
                    .toArray();


                const count = await Product.countDocuments(filter); // Count total products

                res.send({
                    products,
                    totalPages: Math.ceil(count / limit), // Calculate total pages
                    currentPage: parseInt(page)
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
