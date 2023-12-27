const fs = require('fs');
const path = require('path');
const cosmos = require('@azure/cosmos');

require('dotenv').config();

const { CosmosClient } = cosmos;

const dbName = process.env.DB_NAME
const endpoint = process.env.DB_URL;
const key = process.env.DB_PRIMARY_KEY;

(async (mockedDataFile) => {
  const database = new CosmosClient({ endpoint, key }).database(dbName);
  const mockedDataFilePath = path.join(__dirname, '../', mockedDataFile);

  if (!fs.existsSync(mockedDataFilePath)) {
    throw new Error(`${mockedDataFilePath} was not found.`);
  }

  const content = fs.readFileSync(mockedDataFilePath, { encoding: 'utf-8' });
  const mockedData = JSON.parse(content);
  const { products } = mockedData;

  const productsContainer = database.container('products');
  const stocksContainer = database.container('stocks');

  for (const product of products) {
    const { id, title, description, price, count } = product;
    await productsContainer.items.create({ id, title, description, price });
    await stocksContainer.items.create({ product_id: id, count });
  }
})('base-products.json');