import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";

const constants = {
  busConnectionString: process.env.SERVICE_BUS_CONNECTION_STRING,
  queueName: process.env.SERVICE_BUS_QUEUE_NAME,
}

const createMessage = (product: Record<string, string>) => ({ body: product });

const sendMessagesBatch = async (sender: ServiceBusSender, products: Record<string, string>[]) => {
  // Tries to send all messages in a single batch.
  // Will fail if the messages cannot fit in a batch.
  // await sender.sendMessages(messages);

  // create a batch object
  let batch = await sender.createMessageBatch();
  for (const product of products) {
    // for each message in the array
    const message = createMessage(product);
    // try to add the message to the batch
    if (!batch.tryAddMessage(message)) {
      // if it fails to add the message to the current batch
      // send the current batch as it is full
      await sender.sendMessages(batch);

      // then, create a new batch
      batch = await sender.createMessageBatch();

      // now, add the message failed to be added to the previous batch to this batch
      if (!batch.tryAddMessage(message)) {
        // if it still can't be added to the batch, the message is probably too big to fit in a batch
        throw new Error("Message too big to fit in a batch");
      }
    }
  }

  // Send the last created batch of messages to the queue
  await sender.sendMessages(batch);
}

export const sendBatchMessagesToQueue = (data: Record<string, string>[]) => {
  if (!data.length) {
    return;
  }

  // create a Service Bus client using the connection string to the Service Bus namespace
  const sbClient = new ServiceBusClient(constants.busConnectionString);
  // createSender() can also be used to create a sender for a topic.
  const sender = sbClient.createSender(constants.queueName);

  return sendMessagesBatch(sender, data)
    .catch((err) => err)
    .then((error) => {
      sender.close();
      sbClient.close();

      if (error) { throw error };
    });
}