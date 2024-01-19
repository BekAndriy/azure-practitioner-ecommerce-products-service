import { InvocationContext } from '@azure/functions';
import { serviceBusImportProduct } from '../functions/service-bus-import-product';
import * as serviceBus from '../utils/serviceBus';

describe('service-bus-import-product', () => {
  const context: Partial<InvocationContext> = {
    log: (...messages: any[]) => { console.log(...messages) }
  }
  it('should send an error to messages service', async () => {
    const sendFailedTopicNotification = jest.fn();
    jest.spyOn(serviceBus, 'sendFailedTopicNotification').mockImplementation(sendFailedTopicNotification);
    // doesn't have all required fields
    const issuedProduct = { title: 'sdfsdf' }
    await serviceBusImportProduct(issuedProduct as any, context as InvocationContext);
    expect(sendFailedTopicNotification).toHaveBeenCalledTimes(1);
  })
})