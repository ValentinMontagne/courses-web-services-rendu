// Insert a Document
// Add to app.js the following function which uses the insertMany method to add three documents to the documents collection.

const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
console.log('Inserted documents =>', insertResult);
// The insertMany command returns an object with information about the insert operations.

// Find All Documents
// Add a query that returns all the documents.

const findResult = await collection.find({}).toArray();
console.log('Found documents =>', findResult);
// This query returns all the documents in the documents collection. If you add this below the insertMany example you'll see the document's you've inserted.

// Find Documents with a Query Filter
// Add a query filter to find only documents which meet the query criteria.

const filteredDocs = await collection.find({ a: 3 }).toArray();
console.log('Found documents filtered by { a: 3 } =>', filteredDocs);
// Only the documents which match 'a' : 3 should be returned.

// Update a document
// The following operation updates a document in the documents collection.

const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
console.log('Updated documents =>', updateResult);
// The method updates the first document where the field a is equal to 3 by adding a new field b to the document set to 1. updateResult contains information about whether there was a matching document to update or not.

// Remove a document
// Remove the document where the field a is equal to 3.

const deleteResult = await collection.deleteMany({ a: 3 });
console.log('Deleted documents =>', deleteResult);

// Index a Collection
// Indexes can improve your application's performance. The following function creates an index on the a field in the documents collection.

const indexName = await collection.createIndex({ a: 1 });
console.log('index name =', indexName);

// Full documentation : https://www.mongodb.com/docs/drivers/node/current/