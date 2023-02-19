import { TimePeriod } from '../types';

interface RedemptionPeriodProps {
  redemptionEndDate: string;
  travelPeriod: TimePeriod;
}

export class RedemptionPeriod {
  redemptionEndDate: string;

  travelPeriod: TimePeriod;

  private constructor(props: RedemptionPeriodProps) {
    this.redemptionEndDate = props.redemptionEndDate;
    this.travelPeriod = props.travelPeriod;
  }

  static create(props: RedemptionPeriodProps) {
    return new RedemptionPeriod(props);
  }
}
