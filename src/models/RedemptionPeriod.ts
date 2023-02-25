import {
  CreateTableInput,
  KeyType,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, getDynamoDBBillingDetails } from '../lib/aws/dynamodb';
import { TimePeriod, TimePeriodSerialized } from '../types';
import { toDateISO8601 } from '../utils';

const REDEMPTION_PERIOD_TABLE_NAME = 'kf-redemption-periods';

interface RedemptionPeriodProps {
  redemptionEndDate: string;
  travelPeriod: TimePeriodSerialized;
}

type RedemptionPeriodInputProps = {
  redemptionEndDate: Date;
  travelPeriod: TimePeriod;
};

export class RedemptionPeriod {
  redemptionEndDate: string;

  travelPeriod: TimePeriodSerialized;

  private constructor(props: RedemptionPeriodProps) {
    this.redemptionEndDate = props.redemptionEndDate;
    this.travelPeriod = props.travelPeriod;
  }

  static create(props: RedemptionPeriodInputProps) {
    return new RedemptionPeriod({
      redemptionEndDate: toDateISO8601(props.redemptionEndDate),
      travelPeriod: {
        from: toDateISO8601(props.travelPeriod.from),
        to: toDateISO8601(props.travelPeriod.to),
      },
    });
  }

  static getSchema(): CreateTableInput {
    return {
      ...getDynamoDBBillingDetails(),
      TableName: REDEMPTION_PERIOD_TABLE_NAME,
      KeySchema: [
        {
          AttributeName: 'redemptionEndDate',
          KeyType: KeyType.HASH,
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'redemptionEndDate',
          AttributeType: ScalarAttributeType.S,
        },
      ],
    };
  }

  static async upload(redemptionPeriod: RedemptionPeriod) {
    const command = new PutCommand({
      TableName: REDEMPTION_PERIOD_TABLE_NAME,
      Item: redemptionPeriod,
    });
    const putOutput = await ddbDocClient.send(command);

    if (putOutput.$metadata.httpStatusCode === 200) {
      console.log(`1 item uploaded to table "${REDEMPTION_PERIOD_TABLE_NAME}"`);
    }
  }
}
