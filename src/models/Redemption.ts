import {
  CreateTableInput,
  KeyType,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';
import { ddbDocClient, getDynamoDBBillingDetails } from '../lib/aws/dynamodb';
import { dateInYYYYMM, toDateISO8601 } from '../utils';
import { BlackoutPeriod, FlightClass } from '../utils/types';

const REDEMPTION_TABLE_NAME = 'kf-redemptions';

interface RedemptionProps {
  origin: string;
  destination: string;
  flightClass: FlightClass;
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: BlackoutPeriod[];
  region: string;
  redemptionEndDate: string;
  sortKey: string;
}

export type RedemptionInputProps = Omit<
  RedemptionProps,
  'redemptionEndDate' | 'sortKey'
> & {
  redemptionEndDate: Date;
};

export class Redemption {
  origin: string;

  destination: string;

  flightClass: FlightClass;

  flightNo: string;

  milesRequired: number;

  blackoutPeriod: BlackoutPeriod[];

  region: string;

  redemptionEndDate: string;

  sortKey: string;

  private constructor(props: RedemptionProps) {
    this.origin = props.origin;
    this.destination = props.destination;
    this.flightClass = props.flightClass;
    this.flightNo = props.flightNo;
    this.milesRequired = props.milesRequired;
    this.blackoutPeriod = props.blackoutPeriod;
    this.region = props.region;
    this.redemptionEndDate = props.redemptionEndDate;
    this.sortKey = props.sortKey;
  }

  static create(props: RedemptionInputProps) {
    return new Redemption({
      ...props,
      redemptionEndDate: toDateISO8601(props.redemptionEndDate),
      sortKey: this.getSortKey(props),
    });
  }

  static getSortKey(props: RedemptionInputProps) {
    return `${props.flightClass}#${props.origin}#${props.destination}`;
  }

  static getSchema(): CreateTableInput {
    return {
      ...getDynamoDBBillingDetails(),
      TableName: REDEMPTION_TABLE_NAME,
      KeySchema: [
        {
          AttributeName: 'redemptionEndDate',
          KeyType: KeyType.HASH,
        },
        {
          AttributeName: 'sortKey',
          KeyType: KeyType.RANGE,
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'redemptionEndDate',
          AttributeType: ScalarAttributeType.S,
        },
        {
          AttributeName: 'sortKey',
          AttributeType: ScalarAttributeType.S,
        },
      ],
    };
  }

  static async upload(redemptions: Redemption[]) {
    const putOutputs = await Promise.all(
      redemptions.map((redemption) => {
        const command = new PutCommand({
          TableName: REDEMPTION_TABLE_NAME,
          Item: redemption,
        });
        return ddbDocClient.send(command);
      }),
    );

    const successfulPutCount = putOutputs.filter(
      (output) => output.$metadata.httpStatusCode === 200,
    ).length;
    console.log(
      `${successfulPutCount} items uploaded to table "${REDEMPTION_TABLE_NAME}"`,
    );
  }

  /**
   * Retrieves redemptions from AWS DDB based on their redemption end date.
   *
   * Note: To support retrieving by sort key when the use case arises.
   */
  static async query(redemptionEndDate: Date) {
    try {
      const command = new QueryCommand({
        TableName: REDEMPTION_TABLE_NAME,
        KeyConditionExpression: 'redemptionEndDate = :red',
        ExpressionAttributeValues: {
          ':red': toDateISO8601(redemptionEndDate),
        },
      });
      const queryOutput = await ddbDocClient.send(command);

      return (queryOutput.Items ?? []) as Redemption[];
    } catch (err) {
      console.log('[Redemption > query]', err);
      return [];
    }
  }

  static queryLocal(redemptionTravelPeriodFrom: Date) {
    const redemptionTravelPeriodMonth = dateInYYYYMM(
      redemptionTravelPeriodFrom,
    );
    const filepath = path.join(
      'data',
      `${redemptionTravelPeriodMonth}-redemptions.json`,
    );

    const redemptionsString = fs.readFileSync(filepath).toString();
    return JSON.parse(redemptionsString) as Redemption[];
  }

  isIdentical(otherRedemption: Redemption) {
    return (
      this.origin === otherRedemption.origin &&
      this.destination === otherRedemption.destination &&
      this.flightClass === otherRedemption.flightClass &&
      this.flightNo === otherRedemption.flightNo &&
      this.milesRequired === otherRedemption.milesRequired
      // skip checking equivalence of blackoutPeriod because it's a pain and doesn't add much value
    );
  }
}
