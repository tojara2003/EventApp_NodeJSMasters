const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const uri = 'mongodb+srv://polxtian:polxtian@cluster0.xuve8.azure.mongodb.net/demoNative?retryWrites=true&w=majority';

(async () => {
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true
  });

  const dbContext = client.db('test');

  const usersCollection = dbContext.collection('users');

  const document = await usersCollection.findOne({ _id: mongodb.ObjectId('5fd865d4a45dcb1014940679') });

  console.log(document);
})();
