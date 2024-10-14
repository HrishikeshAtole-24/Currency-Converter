const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);


async function insertBooks() {
  try {
    await client.connect();
    const db = client.db("bookstore");
    const books = db.collection("books");

    const bookData = [
      // Your books data
      {
        title: "The God of Small Things",
        author: "Arundhati Roy",
        genre: "Fiction",
        price: 10.99,
        publication_year: 1997,
        stock: 30,
        ratings: [
          { user: "Alice", rating: 5 },
          { user: "Raj", rating: 4 },
        ],
      },
      {
        title: "Midnight's Children",
        author: "Salman Rushdie",
        genre: "Fiction",
        price: 12.50,
        publication_year: 1981,
        stock: 25,
        ratings: [
          { user: "John", rating: 5 },
          { user: "Simran", rating: 4 },
        ],
      },
      {
        title: "The Inheritance of Loss",
        author: "Kiran Desai",
        genre: "Fiction",
        price: 9.99,
        publication_year: 2006,
        stock: 20,
        ratings: [
          { user: "Ravi", rating: 4 },
          { user: "Pooja", rating: 5 },
        ],
      },
      {
        title: "The White Tiger",
        author: "Aravind Adiga",
        genre: "Fiction",
        price: 14.99,
        publication_year: 2008,
        stock: 15,
        ratings: [
          { user: "Neha", rating: 5 },
          { user: "Vikram", rating: 4 },
        ],
      },
      {
        title: "",
        author: "Rohinton Mistry",
        genre: "Fiction",
        price: 11.50,
        publication_year: 1995,
        stock: 18,
        ratings: [
          { user: "Sonia", rating: 4 },
          { user: "Kunal", rating: 5 },
        ],
      },
      {
        title: "Train to Pakistan",
        author: "Khushwant Singh",
        genre: "Historical Fiction",
        price: 7.99,
        publication_year: 1956,
        stock: 22,
        ratings: [
          { user: "Anjali", rating: 5 },
          { user: "Deepak", rating: 4 },
        ],
      },
      {
        title: "The Namesake",
        author: "Jhumpa Lahiri",
        genre: "Fiction",
        price: 10.50,
        publication_year: 2003,
        stock: 28,
        ratings: [
          { user: "Meera", rating: 4 },
          { user: "Sam", rating: 5 },
        ],
      },
      {
        title: "The Palace of Illusions",
        author: "Chitra Banerjee Divakaruni",
        genre: "Fiction",
        price: 9.50,
        publication_year: 2008,
        stock: 35,
        ratings: [
          { user: "Riya", rating: 4 },
          { user: "Ajay", rating: 5 },
        ],
      },
      {
        title: "Godan",
        author: "Premchand",
        genre: "Fiction",
        price: 8.49,
        publication_year: 1936,
        stock: 40,
        ratings: [
          { user: "Rishi", rating: 5 },
          { user: "Aditi", rating: 4 },
        ],
      },
      {
        title: "The Guide",
        author: "R.K. Narayan",
        genre: "Fiction",
        price: 7.75,
        publication_year: 1958,
        stock: 45,
        ratings: [
          { user: "Rahul", rating: 5 },
          { user: "Kavita", rating: 4 },
        ],
      },
    ];
    await books.insertMany(bookData);
    console.log("Books inserted successfully");
  } catch (error) {
    console.error("Error inserting books:", error);
  } finally {
    await client.close();
  }
}

// Uncomment to run the insertBooks function
// insertBooks();

// Function to purchase a book and record the transaction
async function purchaseBook(bookId, quantity, userId) {
  try {
    await client.connect();
    const database = client.db("bookstore");
    const booksCollection = database.collection("books");
    const transactionsCollection = database.collection("transactions");

    const session = client.startSession();
    session.startTransaction();

    try {
      const book = await booksCollection.findOne({ _id: bookId }, { session });
      if (!book || book.stock < quantity) {
        throw new Error("Not enough stock");
      }

      await booksCollection.updateOne(
        { _id: bookId },
        { $inc: { stock: -quantity } },
        { session }
      );

      const transaction = {
        bookId,
        userId,
        quantity,
        price: book.price * (1 - 0.1), // Example for 10% off
        date: new Date(),
      };
      await transactionsCollection.insertOne(transaction, { session });

      await session.commitTransaction();
      console.log("Transaction successful.");
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction aborted:", error);
    } finally {
      session.endSession();
    }
  } finally {
    await client.close();
  }
}

// Uncomment to run the purchaseBook function
// const bookId = new ObjectId("670915c2d75286723ea7eedc"); // Sample book ID
// const userId = new ObjectId("670915c2d75286723ea7eedd"); // Sample user ID
// purchaseBook(bookId, 10, userId).catch(console.error);

// Function to calculate author sales and output to a new collection
async function calculateAuthorSales() {
  try {
    await client.connect();
    const db = client.db("bookstore");
    const transactions = db.collection("transactions");

    const pipeline = [
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $group: {
          _id: "$bookDetails.author",
          totalSales: {
            $sum: { $multiply: ["$quantity", "$price"] },
          },
        },
      },
      { $sort: { totalSales: -1 } },
      { $out: "author_sales" },
    ];

    await transactions.aggregate(pipeline).toArray();
    console.log("Sales aggregation completed successfully.");
  } catch (error) {
    console.error("Error calculating sales:", error);
  } finally {
    await client.close();
  }
}

// Uncomment to run the calculateAuthorSales function
calculateAuthorSales();

  insertBooks();
  
insertBooks();

async function purchaseBook(bookId, quantity, userId) {
  try {
    await client.connect();
    const database = client.db("bookstore");
    const booksCollection = database.collection("books");
    const transactionsCollection = database.collection("transactions");

    const session = client.startSession();
    session.startTransaction();

    try {
      const book = await booksCollection.findOne({ _id: bookId }, { session });
      if (!book || book.stock < quantity) {
        throw new Error("Not enough stock");
      }

      await booksCollection.updateOne(
        { _id: bookId },
        { $inc: { stock: -quantity } },
        { session }
      );

      const transaction = {
        bookId,
        userId,
        quantity,
        price: book.price * (1 - 0.1), 
        date: new Date(),
      };
      await transactionsCollection.insertOne(transaction, { session });

      await session.commitTransaction();
      console.log("Transaction successful.");
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction aborted:", error);
    } finally {
      session.endSession();
    }
  } finally {
    await client.close();
  }
}

// async function main() {
//   const bookId = new ObjectId("67092fee9a20e848f6739b27");
//   const userId = new ObjectId("67092fee9a20e848f6739b28");
//   await purchaseBook(bookId, 5, userId);
// }
// main().catch(console.error);

async function calculateAuthorSales() {
  try {
    await client.connect();
    const db = client.db("bookstore");
    const transactions = db.collection("transactions");

    const pipeline = [
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $group: {
          _id: "$bookDetails.author",
          totalSales: {
            $sum: { $multiply: ["$quantity", "$price"] }, 
          },
        },
      },
      { $sort: { totalSales: -1 } }, 
      { $out: "author_sales" }, 
    ];

    await transactions.aggregate(pipeline).toArray();
    console.log("Sales aggregation completed successfully.");
  } catch (error) {
    console.error("Error calculating sales:", error);
  } finally {
    await client.close();
  }
}

calculateAuthorSales();