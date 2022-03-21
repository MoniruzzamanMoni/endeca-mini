import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import { EdcaUrlSerializer } from '@ibfd/endecapod';
import { MessageService } from 'primeng/api';
import { TopicService } from '../service/topic.service';

import { TopicSearchPanelComponent } from './topic-search-panel.component';
import { TopicServiceConfig } from '../topic-search.module';
import { FakeTopicConfig } from '../service/topic.service.spec';


class TopicServiceMock {
  public registerConfig(config: TopicServiceConfig): void {}
  public loadInitTaxTopics(): boolean {
    return false;
  }
}

describe('TopicSearchPanelComponent', () => {
  let component: TopicSearchPanelComponent;
  let fixture: ComponentFixture<TopicSearchPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopicSearchPanelComponent ],
      providers: [
        MessageService, EdcaUrlSerializer,
        {provide: TopicService, useClass: TopicServiceMock}
      ],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicSearchPanelComponent);
    component = fixture.componentInstance;
    component.topicConfig = FakeTopicConfig;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
