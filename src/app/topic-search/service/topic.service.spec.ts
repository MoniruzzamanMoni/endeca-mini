import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { TopicService } from '../topic-search.module';
import { UrlSerializer, ParamMap } from '@angular/router';
import { EdcaUrlSerializer, EndecapodModule, SearchResult, EndecapodService } from '@ibfd/endecapod';
import { TopicServiceConfig } from '../model/topic-service-config';
import { Observable, of, throwError } from 'rxjs';
import { InitTopicTreeExposeService } from './topic.service';
import { take } from 'rxjs/operators';
import { TopicTreeExposeService } from '../topic-search-panel/topic-search-panel.component';
import { TreeNode } from 'primeng/api';

const fakeTaxonomyData = require('../../../test/mock/taxonomy.mock.json');
class EndecaServiceMock {
  public setName(name: string) {}
  public setURL(url: string, awareURL: string) {}
  public RegisterParams(pm: ParamMap): boolean { return true; }
  public DoSearch() {}
  public Result(): Observable<boolean | SearchResult> { return of(false); }
  public runningquery(): Observable<boolean> { return of(false); }
  public ExposeMultipleOnExisting(svc: EndecapodService, ne: number[]): boolean { return true; }
}

export const FakeTopicConfig: TopicServiceConfig = {
  initQuery: 'N=7407',
  endecapodUrl: '/endecapod',
  awareUrl: '/endecapod/my',
  topicDimensions: [6185, 6201, 6332, 6593, 6680],
  suppressedChips: []
};

describe('TopicService', () => {
  let topicService: TopicService;

  function getFakeTopicSvcConfig(config?: TopicServiceConfig): TopicServiceConfig {
    return {
      ...FakeTopicConfig,
      ...config
    };
  }

  function loadFakeInitTaxTopics (): boolean {
    const initTopicTreeExposeSvc = TestBed.inject(InitTopicTreeExposeService);
    topicService.registerConfig(getFakeTopicSvcConfig());
    const fakeSearchResult = of(new SearchResult(fakeTaxonomyData));
    spyOn(initTopicTreeExposeSvc, 'Result').and.returnValue(fakeSearchResult);
    return topicService.loadInitTaxTopics();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EndecapodModule],
      providers: [TopicService,
        {provide: UrlSerializer, useClass: EdcaUrlSerializer},
        {provide: InitTopicTreeExposeService, useClass: EndecaServiceMock},
        {provide: EndecapodService, useClass: EndecaServiceMock},
        {provide: TopicTreeExposeService, useClass: EndecaServiceMock}
      ]
    });
    topicService = TestBed.inject(TopicService);
  });

  afterEach(() => {
    topicService = null;
  });

  it('should be created', inject([TopicService], (service: TopicService) => {
    expect(service).toBeTruthy();
  }));

  it('should register config', () => {
    const fakeTopicServiceConfig = getFakeTopicSvcConfig();
    topicService.registerConfig(fakeTopicServiceConfig);
    expect((<any>topicService)._topicInitQuery).toBe(fakeTopicServiceConfig.initQuery);
    expect((<any>topicService)._endecaUrl).toBe(fakeTopicServiceConfig.endecapodUrl);
    expect((<any>topicService)._awareUrl).toBe(fakeTopicServiceConfig.awareUrl);
    expect((<any>topicService)._topicDims).toBe(fakeTopicServiceConfig.topicDimensions);
    expect((<any>topicService)._suppressedChips).toBe(fakeTopicServiceConfig.suppressedChips);
  });

  describe('loadInitTaxTopics', () => {
    it('should not load initial tax topics when topicInitQuery is missing', () => {
      topicService.registerConfig(getFakeTopicSvcConfig(<TopicServiceConfig>{initQuery: ''}));
      expect(topicService.loadInitTaxTopics()).toBeFalsy();
    });

    it('should load initial tax topics', (done) => {
      topicService.getTaxonomyProvider().pipe(take(1)).subscribe((taxTopics: Object) => {
        expect(taxTopics).toBeTruthy();
        // always return true if tax topics already loaded
        setTimeout(() => {
          expect(topicService.loadInitTaxTopics()).toBeTruthy();
          done();
        });
      });
      expect(loadFakeInitTaxTopics()).toBeTruthy();
    });
  });

  describe('searchTopics', () => {
    let topicExposeService: TopicTreeExposeService;
    let endecapodService: EndecapodService;

    beforeEach(() => {
      topicService.registerConfig(getFakeTopicSvcConfig());
      topicExposeService = TestBed.inject(TopicTreeExposeService);
      endecapodService = TestBed.inject(EndecapodService);
    });

    afterEach(() => {
      topicExposeService = null;
      endecapodService = null;
    });

    function runEndecaMainSearch(isRunningQuery: Observable<boolean>, searchResult: Observable<any>) {
      spyOn(endecapodService, 'runningquery').and.returnValue(isRunningQuery);
      spyOn(topicExposeService, 'Result').and.returnValue(searchResult);
    }

    it('should return searched topics', (done) => {
      const isRunningQuery = of(true), searchResult = of(new SearchResult(fakeTaxonomyData));
      runEndecaMainSearch(isRunningQuery, searchResult);
      topicService.searchTopics(topicExposeService, endecapodService).pipe(take(1))
        .subscribe((res: Object) => {
          expect(res).toBeTruthy();
          done();
        });
    });

    it('should catch error when searching topics', (done) => {
      const expectedErrorMessage = 'this is a  error';
      const isRunningQuery = of(true), searchResult = throwError(new Error(expectedErrorMessage));
      runEndecaMainSearch(isRunningQuery, searchResult);
      topicService.searchTopics(topicExposeService, endecapodService).pipe(take(1))
        .subscribe(() => {}, (err: Error) => {
          expect(err.message).toBe(expectedErrorMessage);
          done();
        });
    });

    it('should catch http response error when searching topics', (done) => {
      const fakeHttpErrorResp = new Response('', {headers: {}, status: 404, statusText: 'Not found'} );
      fakeHttpErrorResp.json = () => new Promise((resolve, reject) => {
        resolve(undefined);
      });
      const isRunningQuery = of(true), searchResult = throwError(fakeHttpErrorResp);
      runEndecaMainSearch(isRunningQuery, searchResult);
      topicService.searchTopics(topicExposeService, endecapodService).pipe(take(1))
        .subscribe(() => {}, (err: Error) => {
          expect(err).toBeTruthy();
          done();
        });
    });
  });

  describe('buildTopicTree', () => {
    const fakeSearchedTopics = {
      '1_1' : {code: '1_1', label: 'Corporate Taxation', id: 6186},
      '1_1_1' : {code: '1_1_1', label: 'Taxing Jurisdiction', id: 6202},
      '1_1_1_1' : {code: '1_1_1_1', label: 'Resident / Residence', id: 6335},
      '1_1_1_1_1' : {code: '1_1_1_1_1', label: 'Resident', id: 6714},
      '1_1_1_1_2' : {code: '1_1_1_1_2', label: 'Non-Resident', id: 6715},
      '1_1_1_2' : {code: '1_1_1_2', label: 'Source', id: 6334},
      '1_1_1_2_1' : {code: '1_1_1_2_1', label: 'Domestic', id: 6842},
      '1_1_1_2_2' : {code: '1_1_1_2_2', label: 'Foreign', id: 6843},
      'invalid_id' : {code: 'invalid_code', label: 'Invalid', id: Number.MIN_SAFE_INTEGER},
    };


    beforeEach((done) => {
      loadFakeInitTaxTopics();
      done();
    });

    it('should build topic tree', (done) => {
      const fakeChips = [6202];
      topicService.getTopicTree().pipe(take(1))
        .subscribe((topicTree: {data: Object[], selected: Object[]}) => {
          const {data, selected} = topicTree;
          expect(!!data.length).toBe(true);
          expect(selected.some(st => fakeChips.includes(st['id']))).toBe(true);
          done();
        });
      topicService.buildTopicTree({topics: fakeSearchedTopics, chips: fakeChips}, new Set());
    });
  });

  describe('buildDocTopicTree', () => {
    const fakeTopicCodes = ['1_1', '1_1_1', '1_1_1_1', '1_1_1_1_1', '1_1_1_1_2', '1_1_1_2_2',
      '1_1_2', '1_1_21', '1_1_21_11', '1_1_21_12_1', '1_1_21_14', '1_1_21_15', '1_1_22', '1_1_22_1',
      '1_1_22_2', '1_1_22_32', '1_1_24', '1_1_24_1', '1_1_24_2', '1_1_24_3', '1_1_31_1', 'invalid_code'];

    beforeEach(fakeAsync(() => {
      loadFakeInitTaxTopics();
      tick();
    }));

    it('should build document topic tree', (done) => {
      topicService.getDocTopicTree().pipe(take(1))
        .subscribe((docTopicTree: TreeNode[]) => {
          expect(!!docTopicTree.length).toBeTruthy();
          done();
        });
      topicService.buildDocTopicTree(fakeTopicCodes);
    });
  });
});
