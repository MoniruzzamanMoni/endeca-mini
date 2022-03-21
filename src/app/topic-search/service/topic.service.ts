import { Injectable } from '@angular/core';
import { EndecapodService, SearchResult, EdcaUrlSerializer } from '@ibfd/endecapod';
import { Subject, AsyncSubject, Observable, BehaviorSubject, ObservableInput, Subscription } from 'rxjs';
import { catchError, filter, map, first, concatMap, tap } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { TopicServiceConfig } from '../model/topic-service-config';

export class InitTopicTreeExposeService extends EndecapodService {}

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private taxonomyProvider = new AsyncSubject();
  private topicTreeProvider: Subject<any>;
  private docTopicTreeProvider: Subject<any>;
  private error: BehaviorSubject<Error | boolean> = new BehaviorSubject(false);
  private taxonomyProviderSubscription: Subscription;

  private _topicInitQuery: string;
  private _endecaUrl: string;
  private _awareUrl: string;
  private _topicDims: number[];
  private _suppressedChips: number[];

  constructor(
    private urlSerializer: EdcaUrlSerializer,
    private initTopicSvc: InitTopicTreeExposeService
  ) {
  }

  /**
   * Call this before using this service
   */
  public registerConfig(config: TopicServiceConfig): void {
    this._topicInitQuery = config.initQuery;
    this._endecaUrl = config.endecapodUrl;
    this._topicDims = config.topicDimensions;
    this._suppressedChips = config.suppressedChips;
    this._awareUrl = config.awareUrl;
  }

  loadInitTaxTopics(): boolean {
    const initQuery = this._topicInitQuery;
    if (!initQuery || initQuery.length === 0) {
      return false;
    }
    if (this.taxonomyProviderSubscription) {
      return true;
    }
    this.initTopicSvc.setName('TopicTreeInitService');
    this.initTopicSvc.setURL(this._endecaUrl, this._awareUrl);
    this.initTopicSvc.RegisterParams(
      this.urlSerializer.parse('?' + initQuery).queryParamMap
    );
    this.initTopicSvc.DoSearch();
    this.taxonomyProviderSubscription = this.getTopicValues(this.initTopicSvc.Result())
      .pipe(
      map(res => {
        const topics = res.topics;
        Object.keys(topics).map(e => topics[e])
          .forEach(obj => obj['selectable'] = false);
        return topics;
      }),
      first(),
      catchError(this.handle_error)
    )
    .subscribe(
      t => {
        this.taxonomyProvider.next(t);
        this.taxonomyProvider.complete();
      }
    );
    return true;
  }

  getTaxonomyProvider(): Observable<any> {
    return this.taxonomyProvider.asObservable();
  }

  buildTopicTree(searchedTopics: Object, expandedNodes: Set<number>) {
    this.getTaxonomyProvider().subscribe({
      next: taxtopics => {
        // Updating taxonomy taxtopics by searched topics from endeca
        const clonedTaxtopics = cloneDeep(taxtopics);
        this.updateAvailableTopics(clonedTaxtopics, Object.keys(searchedTopics['topics']));
        this.topicTreeProvider.next(this.buildPrimeNgTree(clonedTaxtopics, searchedTopics['chips'], expandedNodes));
      },
      error: err => { this.error.next(err); }
    });
  }

  buildDocTopicTree(topicCodes: string[]) {
    this.getTaxonomyProvider().subscribe({
      next: taxtopics => {
        const clonedTaxtopics = cloneDeep(taxtopics);
        this.updateAvailableDocTopics(clonedTaxtopics, topicCodes);
        const docTopicTree = this.buildPrimeNgTree(clonedTaxtopics, [], new Set()).data;
        this.docTopicTreeProvider.next(docTopicTree);
      },
      error: err => { this.error.next(err); }
    });
  }

  private updateAvailableDocTopics(taxtopics: Object, topicCodes: string[]) {
    topicCodes.forEach(topicCode => {
      const taxtopic = taxtopics[topicCode];
      if (taxtopic) {
        taxtopic.selectable = true;
        let parentLabel = this.getTaxtopicParentLabel(topicCode);
        while (parentLabel.lastIndexOf('_') > 0) {
          const parent = taxtopics[parentLabel];
          if (parent) {
            parent.selectable = true;
          }
          parentLabel = this.getTaxtopicParentLabel(parentLabel);
        }
      }
    });
  }

  private updateAvailableTopics(taxtopics: Object, topicCodes: string[]) {
    topicCodes.forEach(topicCode => {
      const taxtopic = taxtopics[topicCode];
      if (taxtopic) {
        taxtopic.selectable = true;
      }
    });
  }

  getTopicTree(): Observable<any> {
    return (this.topicTreeProvider = this.topicTreeProvider || new Subject<any>()).asObservable();
  }

  getDocTopicTree(): Observable<any> {
    return (this.docTopicTreeProvider = this.docTopicTreeProvider || new Subject<any>()).asObservable();
  }

  private buildPrimeNgTree(taxtopics: Object, chips: any[], expandedNodes: Set<number>) {
    return Object.keys(taxtopics)
    .map(e => taxtopics[e])
    .reduce((acc, taxtopic) => {
      const node = {
        label: taxtopic['label'],
        data: taxtopic['code'],
        selectable: taxtopic['selectable'],
        id: taxtopic['id'],
        key: taxtopic['code']
      };
      if (chips.find(id => id === node.id)) {
        acc.selected.push(node);
      }
      node['expanded'] = expandedNodes.has(node.id);
      const parent = this.getTaxtopicParent(acc.data, this.getTaxtopicParentLabel(node.data));
      if (parent) {
        if (!parent['children']) {
          parent['children'] = [];
        }
        node['parent'] = parent;
        parent['children'].push(node);
      } else {
        acc.data.push(node);
      }
      return acc;
    }, {data: [], selected: []});
  }

  private getTaxtopicParentLabel(tc: string) {
    return tc.substring(0, tc.lastIndexOf('_'));
  }

  private getTaxtopicParent(acc: Object[], parentLabel: string) {
    for (let i = 0; i < acc.length; i++) {
      const taxtopic = acc[i];
      if (taxtopic['data'] === parentLabel) {
        return taxtopic;
      }
      if (taxtopic['children']) {
        const taxtopicParent = this.getTaxtopicParent(taxtopic['children'], parentLabel);
        if (taxtopicParent) {
          return taxtopicParent;
        }
      }
    }
  }

  searchTopics(topicExposeService: EndecapodService, endecapodService: EndecapodService): Observable<boolean | SearchResult> {
    return endecapodService.runningquery().pipe(filter(rq => !!rq), concatMap(
      q => {
        topicExposeService.ExposeMultipleOnExisting(
          endecapodService,
          this._topicDims
        );
        return this.getTopicValues(topicExposeService.Result());
      }));
  }

  private getTopicValues(searchresult: Observable<boolean | SearchResult>) {
    return searchresult.pipe(
      filter(res => res instanceof SearchResult),
      map((res: SearchResult) => {
        let topics = [];
        this._topicDims
          .forEach(dimId => {
            const dim = res.getDimension(dimId);
            topics = topics.concat(dim ? dim.values : []);
          });
          const chips = res.getChips()
          .filter(c1 => !this._suppressedChips.find(s => c1.parent.id === s))
          .map(chip => chip.dimension.id);
        return {topics: topics, chips: chips};
      }),
      first(),
      map(obj => {
        const topics = obj.topics
          .map(topic => {
            const name = topic.name;
            return {
              code: name.substring(0, name.indexOf(' ')),
              label: name.substring(name.indexOf(' ') + 1),
              id: topic.id
            };
          })
          .reduce((acc, topic) => {
            return Object.assign(acc, { [topic['code']]: topic });
          }, {});
          return {topics: topics, chips: obj.chips };
      }),
      first(),
      catchError(this.handle_error)
    );
  }

  private handle_error(error: any, caught: Observable<any>): ObservableInput<{}> {
    let errMsg: string;
    if (error instanceof Response) {
      const err = error.json().then(json => JSON.stringify(json)) || '';
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    throw (new Error(errMsg));
  }

  getError(): Observable<Error | Boolean> {
    return this.error.asObservable();
  }
}
