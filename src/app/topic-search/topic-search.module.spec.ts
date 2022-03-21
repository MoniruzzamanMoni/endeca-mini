import { TopicSearchModule } from './topic-search.module';

describe('TopicSearchModule', () => {
  let topicSearchModule: TopicSearchModule;

  beforeEach(() => {
    topicSearchModule = new TopicSearchModule();
  });

  it('should create an instance', () => {
    expect(topicSearchModule).toBeTruthy();
  });
});
