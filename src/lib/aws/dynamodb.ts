import {
  CreateTableCommand,
  CreateTableInput,
  DeleteTableCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Redemption } from '../../models/Redemption';
import { RedemptionPeriod } from '../../models/RedemptionPeriod';

// Client config

const ddbClientConfig: DynamoDBClientConfig = {
  region: 'ap-southeast-1',
};

export const ddbClient = new DynamoDBClient(ddbClientConfig);
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  },
});

export const getDynamoDBBillingDetails = (): Pick<
  CreateTableInput,
  'BillingMode'
> => ({
  BillingMode: 'PAY_PER_REQUEST',
});

// DDB scripts

export async function createTables() {
  const tableSchemas = [Redemption.getSchema(), RedemptionPeriod.getSchema()];

  const createTablesOutput = await Promise.all(
    tableSchemas.map((tableSchema) =>
      ddbClient.send(new CreateTableCommand(tableSchema)),
    ),
  );

  const createTablesNames = createTablesOutput
    .map((createTableOutput) => createTableOutput.TableDescription?.TableName)
    .join(', ');
  console.log(`Tables created: ${createTablesNames}`);
}

export async function deleteTables() {
  const tableSchemas = [Redemption.getSchema(), RedemptionPeriod.getSchema()];

  const deleteTablesOutput = await Promise.all(
    tableSchemas.map((tableSchema) =>
      ddbClient.send(new DeleteTableCommand(tableSchema)),
    ),
  );

  const deleteTablesNames = deleteTablesOutput
    .map((deleteTableOutput) => deleteTableOutput.TableDescription?.TableName)
    .join(', ');
  console.log(`Tables deleted: ${deleteTablesNames}`);
}

async function run(operation: string | undefined) {
  if (!operation) {
    throw new Error('Specify an operation: "create", "delete"');
  }

  if (operation === 'create') {
    await createTables();
  } else if (operation === 'delete') {
    await deleteTables();
  }
}

if (require.main === module) {
  const [operation] = process.argv.slice(2);

  run(operation)
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}
