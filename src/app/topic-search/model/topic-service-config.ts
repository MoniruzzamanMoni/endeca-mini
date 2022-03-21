export class TopicServiceConfig {
  constructor(
  readonly initQuery: string,
  readonly endecapodUrl: string,
  readonly awareUrl: string,
  readonly topicDimensions: number[],
  readonly suppressedChips: number[]) {  }
}
