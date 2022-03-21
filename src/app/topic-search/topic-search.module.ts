import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicSearchPanelComponent } from './topic-search-panel/topic-search-panel.component';
import { TreeModule } from 'primeng/tree';
import { TopicService, InitTopicTreeExposeService } from './service/topic.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    CollapseModule.forRoot()
  ],
  declarations: [TopicSearchPanelComponent],
  exports: [TopicSearchPanelComponent],
  providers: [TopicService, InitTopicTreeExposeService]
})
export class TopicSearchModule { }
export { TopicService } from './service/topic.service';
export { TopicServiceConfig } from './model/topic-service-config';
