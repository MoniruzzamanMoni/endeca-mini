import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { EndecapodService } from '@ibfd/endecapod';
import { Subscription } from 'rxjs';
// import { MessageService } from 'primeng/components/common/messageservice';
import { TopicService } from '../service/topic.service';
import { TopicServiceConfig } from '../model/topic-service-config';

export class TopicTreeExposeService extends EndecapodService {}

@Component({
  selector: 'app-topic-search-panel',
  templateUrl: './topic-search-panel.component.html',
  styleUrls: ['./topic-search-panel.component.css'],
  providers: [{ provide: TopicTreeExposeService, useClass: TopicTreeExposeService }]
})
export class TopicSearchPanelComponent implements OnInit, OnDestroy {
  /** @internal */
  @Input()
  topicConfig: TopicServiceConfig;

  /** @internal */
  @Input()
  loading = false;
  @Output() isLoading: EventEmitter<boolean> = new EventEmitter();

  /** @internal */
  topicTreeNodes: TreeNode[];
  /** @internal */
  selectedTopics: TreeNode[];
  /** @internal */
  enabled: boolean;
  /** @internal */
  expandedNodeIds = new Set<number>();
  /** @internal */
  isPanelCollapsed = false;

  private subscription: Subscription;

  constructor(
    // private messageService: MessageService,
    private topicService: TopicService,
    private topicExposeService: TopicTreeExposeService,
    private endecapodService: EndecapodService
  ) {
  }

  ngOnInit() {
    this.topicService.registerConfig(this.topicConfig);
    this.topicExposeService.setName('TopicTreeService');
    this.topicExposeService.setURL(this.topicConfig.endecapodUrl, this.topicConfig.awareUrl);
    this.enabled = this.topicService.loadInitTaxTopics();
    if (!this.enabled) {
      return;
    }

    this.subscription = this.topicService.searchTopics(this.topicExposeService, this.endecapodService)
      .subscribe({
        next: searchedTopics => this.topicService.buildTopicTree(searchedTopics, this.expandedNodeIds),
        // error: err => this.messageService.add({ severity: 'error', summary: '', detail: err })
      });

    this.subscription.add(
      this.topicService.getTopicTree().subscribe({
        next: topicTree => {
          this.topicTreeNodes = <TreeNode[]>topicTree.data;
          this.selectedTopics = <TreeNode[]>topicTree.selected;
          this.expandParents(this.selectedTopics);
          this.isLoading.emit(false);
        },
        // error: err => this.messageService.add({ severity: 'error', summary: '', detail: err })
      })
    );

    this.subscription.add(this.topicExposeService.Error().subscribe(
      res => {
        if (res) {
          // this.messageService.add({ severity: 'error', summary: '', detail: res.toString() });
        }
      },
      // err => this.messageService.add({ severity: 'error', summary: '', detail: err })
    ));

    this.subscription.add(this.topicService.getError().subscribe(
      res => {
        if (res) {
          // this.messageService.add({ severity: 'error', summary: '', detail: res.toString() });
        }
      },
      // err => this.messageService.add({ severity: 'error', summary: '', detail: err })
    ));
  }

  /** @internal */
  togglePanel() {
    this.isPanelCollapsed = !this.isPanelCollapsed;
    return false;
  }

  nodeSelect(event) {
    this.endecapodService.Add(event.node.id);
    console.log('nodeSelect: ' + this.nodePath(event.node).join(' > '));
    this.isLoading.emit(true);
  }

  nodeUnselect(event) {
    this.endecapodService.Remove(event.node.id);
    this.isLoading.emit(true);
  }

  nodeExpand(event) {
    this.expandedNodeIds.add(event.node.id);
  }

  nodeCollapse(event) {
    this.expandedNodeIds.delete(event.node.id);
  }

  private nodePath(node: TreeNode): string[] {
    const labels = [node.label];
    while (node.parent) {
      node = node.parent;
      labels.push(node.label);
    }
    return labels.reverse();
  }

  private expandParents(nodes: TreeNode[]) {
    nodes.forEach(node => {
      node.selectable = true;
      let parent = node.parent;
      while (parent) {
        parent.expanded = true;
        this.expandedNodeIds.add(parent['id']);
        parent = parent.parent;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
