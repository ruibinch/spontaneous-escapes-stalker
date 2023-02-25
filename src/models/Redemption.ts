import {
  CreateTableInput,
  KeyType,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, getDynamoDBBillingDetails } from '../lib/aws/dynamodb';
import { toDateISO8601 } from '../utils';

const REDEMPTION_TABLE_NAME = 'kf-redemptions';

export enum FlightClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST = 'First',
}

interface RedemptionProps {
  origin: string;
  destination: string;
  flightClass: FlightClass;
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: string;
  region: string;
  redemptionEndDate: string;
  sortKey: string;
}

type RedemptionInputProps = Omit<RedemptionProps, 'redemptionEndDate'> & {
  redemptionEndDate: Date;
  sortKey: string;
};

export class Redemption {
  origin: string;

  destination: string;

  flightClass: FlightClass;

  flightNo: string;

  milesRequired: number;

  // TODO: to format into TimePeriod[]
  blackoutPeriod: string;

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
}
