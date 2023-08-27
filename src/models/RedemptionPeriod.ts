import {
  CreateTableInput,
  KeyType,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import { ddbDocClient, getDynamoDBBillingDetails } from '../lib/aws/dynamodb';
import { dateInYYYYMM, toDateISO8601 } from '../utils';
import { TimePeriod, TimePeriodSerialized } from '../utils/types';

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

  static async upload(redemptionPeriodProps: RedemptionPeriodInputProps) {
    const command = new PutCommand({
      TableName: REDEMPTION_PERIOD_TABLE_NAME,
      Item: RedemptionPeriod.create(redemptionPeriodProps),
    });
    const putOutput = await ddbDocClient.send(command);

    if (putOutput.$metadata.httpStatusCode === 200) {
      console.log(`1 item uploaded to table "${REDEMPTION_PERIOD_TABLE_NAME}"`);
    }
  }

  static async get(redemptionEndDate: string) {
    try {
      const command = new GetCommand({
        TableName: REDEMPTION_PERIOD_TABLE_NAME,
        Key: {
          redemptionEndDate,
        },
      });
      const getOutput = await ddbDocClient.send(command);

      return getOutput.Item as RedemptionPeriod | undefined;
    } catch (err) {
      console.log('[RedemptionPeriod > get]', err);
      return undefined;
    }
  }

  /**
   * Checks the RedemptionPeriod table on DDB if the input redemption date is present.
   */
  static async exists(redemptionEndDate: Date) {
    const result = await this.get(toDateISO8601(redemptionEndDate));
    return Boolean(result);
  }

  /**
   * Checks local /data folder if there is a redemptions.json file for the input redemption travel month.
   */
  static existsLocal(redemptionTravelPeriodFrom: Date) {
    const redemptionTravelPeriodMonth = dateInYYYYMM(
      redemptionTravelPeriodFrom,
    );
    const redemptionsFiles = fs
      .readdirSync('data')
      .filter((filename) => filename.endsWith('redemptions.json'));

    return redemptionsFiles.some((filename) =>
      filename.includes(redemptionTravelPeriodMonth),
    );
  }
}
