import { hash } from '../utils';

export enum FlightClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST = 'First',
}

interface RedemptionInputProps {
  origin: string;
  destination: string;
  flightClass: FlightClass;
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: string;
  region: string;
  redemptionEndDate: string;
}

interface RedemptionProps extends RedemptionInputProps {
  id: string;
}

export class Redemption {
  id: string;

  origin: string;

  destination: string;

  flightClass: FlightClass;

  flightNo: string;

  milesRequired: number;

  // TODO: to format into TimePeriod[]
  blackoutPeriod: string;

  region: string;

  redemptionEndDate: string;

  private constructor(props: RedemptionProps) {
    this.id = props.id;
    this.origin = props.origin;
    this.destination = props.destination;
    this.flightClass = props.flightClass;
    this.flightNo = props.flightNo;
    this.milesRequired = props.milesRequired;
    this.blackoutPeriod = props.blackoutPeriod;
    this.region = props.region;
    this.redemptionEndDate = props.redemptionEndDate;
  }

  static create(props: RedemptionInputProps) {
    return new Redemption({
      ...props,
      id: this.generateHash(props),
    });
  }

  static generateHash(props: RedemptionInputProps) {
    const propsStringified = Object.values(props).map((prop) =>
      JSON.stringify(prop),
    );
    return hash(...propsStringified);
  }
}
