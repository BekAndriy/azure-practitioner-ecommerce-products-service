import { ServiceBusClient } from "@azure/service-bus";

const constants = {
  busConnectionString: process.env.SERVICE_BUS_CONNECTION_STRING,
  topicName: process.env.SERVICE_BUS_TOPIC_NAME,
}

const sendTopicNotification = async (message: unknown, type: 'failed' | 'success') => {
  // create a Service Bus client using the connection string to the Service Bus namespace
  const sbClient = new ServiceBusClient(constants.busConnectionString);
  // createSender() can also be used to create a sender for a topic.
  const sender = sbClient.createSender(constants.topicName);

  try {
    await sender.sendMessages({ body: message, applicationProperties: { type } });

    await sender.close();
    await sbClient.close();
  }
  catch (error) {
    await sbClient.close();
    throw error;
  }
}
export const sendFailedTopicNotification = (failedProduct: Record<string, string | number>, errors: Record<string, string>) => {
  return sendTopicNotification({ product: failedProduct, errors }, 'failed');
}

export const sendSuccessTopicNotification = (successProduct: Record<string, string | number>) => {
  return sendTopicNotification(successProduct, 'success');
}