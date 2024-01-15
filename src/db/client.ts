import { CosmosClient, Database } from '@azure/cosmos';

const dbName = process.env.DB_NAME
const endpoint = process.env.DB_URL;
const key = process.env.DB_PRIMARY_KEY;

export class Client {
  private static client: Database | null = null;

  private constructor() {

  }

  static get database() {
    if (!this.client) {
      this.client = new CosmosClient({ endpoint, key }).database(dbName)
    }
    return this.client;
  }

  static container(containerName: string) {
    return Client.database.container(containerName)
  }
}