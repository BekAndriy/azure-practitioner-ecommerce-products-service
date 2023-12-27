export const parseStream = async <T extends object>(body: ReadableStream): Promise<T> => {
  const reader = body.getReader();

  const stream = new ReadableStream({
    start(controller) {
      // The following function handles each data chunk
      function push() {
        // "done" is a Boolean and value a "Uint8Array"
        reader.read().then(({ done, value }) => {
          // If there is no more data to read
          if (done) {
            reader.releaseLock()
            controller.close();
            return;
          }
          // Get the data and send it to the browser via the controller
          controller.enqueue(value);
          push();
        });
      }

      push();
    },
  });
  const stringBody = await (new Response(stream, { headers: { "Content-Type": "text/html" } })
    .text());
  return JSON.parse(stringBody);
}