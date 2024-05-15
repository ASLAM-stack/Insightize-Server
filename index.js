const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.qcl7kvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const porductCollection = client.db('ProductsDB').collection('products');
    const recommendCollection = client.db('ProductsDB').collection('Recommended');
    
    app.post(('/recommend'), async(req,res) =>{
      const recommend = req.body;
      const result = await recommendCollection.insertOne(recommend)
      res.send(result)
    })

    app.post('/products',async (req,res) => {
      const product = req.body;
      const result = await porductCollection.insertOne(product)
      res.send(result)
    })

    app.get('/recentadd',async(req,res) =>{
      const cursor = await porductCollection.find().toArray();
      const result =  cursor.reverse().slice(0,6);
      res.send(result)
    })

    app.get('/products', async (req,res) => {
      const cursor = porductCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.put('/product/update/:id',async(req,res) => {
      const id = req.params.id;
      const info = req.body;
      const filter = {_id: new ObjectId(id)};
      const option = {upsert:true}
      const updateInfo = {
        $set:{
          recommendationCount:info.recommendationCount_New
        }
      }
      const result = await porductCollection.updateOne(filter,updateInfo,option)
      res.send(result)
    })

    app.get('/query/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await porductCollection.findOne(query)
      res.send(result)
    })

    app.get('/my_query/:email',async(req,res) => {
      const email = req.params.email;
      const query = {email: email}
      const result = await porductCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/my_recommend/:email',async(req,res) => {
      const email = req.params.email;
      const query = {userEmail: email}
      const result = await recommendCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/my_recommendation/:email',async(req,res) => {
      const email = req.params.email;
      const query = {
        RecommenderEmail: email}
      const result = await recommendCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/recommends/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {queryID:id}
      const result = await recommendCollection.find(query).toArray()
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('server is running')
})
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})