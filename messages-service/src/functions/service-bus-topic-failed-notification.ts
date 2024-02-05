import { app, InvocationContext } from "@azure/functions";

const constants = {
  serviceBusName: process.env.SERVICE_BUS_NAME,
  serviceBusConnectionString: process.env.SERVICE_BUS_CONNECTION_STRING,
  environment: process.env.AZ_ENVIRONMENT,
}

export async function serviceBusTopicFailedNotification(message: unknown, context: InvocationContext) {
  // Here can be added logic for custom logger or notification for users by sending email.
  context.log(`Service Bus topic failed subscription message "${JSON.stringify(message)}"`);
};

app.serviceBusTopic('service-bus-topic-failed-notification', {
  connection: 'SERVICE_BUS_CONNECTION_STRING',
  subscriptionName: `${constants.serviceBusName}-failed-topic-${constants.environment}`,
  topicName: `${constants.serviceBusName}-topic-${constants.environment}`,
  handler: serviceBusTopicFailedNotification
});
