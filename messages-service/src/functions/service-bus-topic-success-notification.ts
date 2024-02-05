import { app, InvocationContext } from "@azure/functions";

const constants = {
  serviceBusName: process.env.SERVICE_BUS_NAME,
  serviceBusConnectionString: process.env.SERVICE_BUS_CONNECTION_STRING,
  environment: process.env.AZ_ENVIRONMENT,
}

export async function serviceBusTopicSuccessNotification(message: unknown, context: InvocationContext) {
  // Here can be added logic for custom logger or notification for users by sending email.
  context.log(`Service Bus topic success subscription message "${JSON.stringify(message)}"`);
};

app.serviceBusTopic('service-bus-topic-success-notification', {
  connection: 'SERVICE_BUS_CONNECTION_STRING',
  subscriptionName: `${constants.serviceBusName}-success-topic-${constants.environment}`,
  topicName: `${constants.serviceBusName}-topic-${constants.environment}`,
  handler: serviceBusTopicSuccessNotification
});
