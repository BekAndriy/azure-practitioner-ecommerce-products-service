import { app, InvocationContext } from '@azure/functions';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid'
import { Product, productValidationObj } from '../models/Product'
import { Stock, stockValidationObj } from '../models/Stock'
import { validateYupObj } from '../utils/data';
import { Client } from '../db';
import { sendFailedTopicNotification, sendSuccessTopicNotification } from '../utils/serviceBus';

interface InputProductData extends Omit<Product, 'id'>, Pick<Stock, 'count'> {
  id?: string;
};

const constants = {
  queueName: process.env.SERVICE_BUS_QUEUE_NAME,
}

const yupBodySchema = yup.object({
  ...productValidationObj,
  ...stockValidationObj,
  id: yup.string().trim().uuid()
}).required();

const validateBody = (body: InputProductData) => {
  return validateYupObj(yupBodySchema, body);
}

const saveProduct = async (productData: InputProductData) => {
  const { price, title, description, count } = productData;
  const productId = uuidv4();

  await Client.container('products').items
    .create({ id: productId, price, title, description });
  await Client.container('stocks').items
    .create({ product_id: productId, count });
}

const updateProduct = async (productData: InputProductData) => {
  const { id, price, title, description, count } = productData;
  const stocksContainer = Client.container('stocks');

  await Client.container('products').item(id, id).replace({ id, price, title, description });
  await stocksContainer.items.query({
    query: 'SELECT * FROM stocks s WHERE s.product_id = @productId',
    parameters: [{ name: '@productId', value: id }]
  })
    .fetchAll()
    .then(({ resources }) => resources[0])
    .then((resource) => stocksContainer.item(resource.id, id).replace({ product_id: id, count }));
}

const saveProducts = async (productData: InputProductData) => {
  if (productData.id) {
    await updateProduct(productData);
  } else {
    await saveProduct(productData);
  }
}

export async function serviceBusImportProduct(message: InputProductData, context: InvocationContext): Promise<void> {
  context.log('Message: ', message, 'Message data type: ', typeof message);
  const { count, price, id, title, description } = message ?? {};
  const productData = {
    title,
    count: +count,
    price: +price,
    ...id ? { id } : {},
    ...description ? { description } : {}
  };
  try {
    const errorMessages = await validateBody(productData);

    if (errorMessages) {
      await sendFailedTopicNotification(productData, errorMessages);
    } else {
      await saveProducts(productData);
      await sendSuccessTopicNotification(productData);
    }

    context.log('Product Saved');
  } catch (error) {
    await sendFailedTopicNotification(productData, { status: '500', message: error.message })
      .catch(() => null)
  }
}

app.serviceBusQueue('service-bus-import-product', {
  connection: 'SERVICE_BUS_CONNECTION_STRING',
  queueName: constants.queueName,
  handler: serviceBusImportProduct,
});