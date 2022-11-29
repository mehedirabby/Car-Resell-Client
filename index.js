const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const {
  MongoClient,
  ServerApiVersion,

  ObjectId,
} = require("mongodb");

require("dotenv").config();
const jwt = require("jsonwebtoken");

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1dsbujx.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const categoryCollection = client.db("rentCar").collection("categories");
    const bookingCollection = client.db("rentCar").collection("bookings");
    const usersCollection = client.db("rentCar").collection("users");
    app.get("/categories", async (req, res) => {
      const query = {};
      const cursor = categoryCollection.find(query);
      const category = await cursor.toArray();
      res.send(category);
    });

    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const category = await categoryCollection.findOne(query);

      res.send(category);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }

      const cursor = bookingCollection.find(query);
      const bookings = await cursor.toArray();
      res.send(bookings);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });
    app.patch("bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const status = req.body.status;
      const updateDoc = {
        $Set: {
          status: status,
        },
      };
      const result = await bookingCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "403" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Car rental server is running");
});

app.listen(port, () => {
  console.log(`Genious car server is running on ${port}`);
});
