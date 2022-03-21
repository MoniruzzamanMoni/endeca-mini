import { Component, OnInit } from '@angular/core';
import { filter, map, mergeMap, switchMap, take, toArray } from 'rxjs/operators';
import { EdcaUrlSerializer, EndecapodService, SearchResult } from '@ibfd/endecapod';
import { from, of } from 'rxjs';
import { NavigationOption } from '../shared/navigation-option';
import { TopicServiceConfig } from '../topic-search/topic-search.module';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  searchResult: SearchResult | boolean = true;
  endecaRecordsUser: any[] = [];
  initialOptions: NavigationOption[] = [];
  offset: number = 0;
  id: number;
  dirty = false;


  /** @internal */
  topicConfig: TopicServiceConfig;
  /** @internal */
  loading: boolean = false;


  constructor(
    private endecapodService: EndecapodService,
    private urlSerializer: EdcaUrlSerializer
  ) {
    this.loadInitQuery();
    this.initialOptions = [
      new NavigationOption(4293599279, 'News'),
      new NavigationOption(4293590545, 'Global topics'),
      new NavigationOption(4293588598, 'Primary Sources')
    ];

    this.topicConfig =  {
      "initQuery": "N=3+10&Ne=6185+6201+6332+6593+6680&select=relative_path",
      "endecapodUrl": "/endecapod",
      "awareUrl": "/endecapod/my",
      "topicDimensions": [
        6185,
        6201,
        6332,
        6593,
        6680
      ],
      "suppressedChips": [
        3368,
        3686,
        7487
      ]
    };
  }

  topicSearchLoading(isLoading: boolean) {
    // if (isLoading) {
    //   this.stateService.save(StateService.STATE_KEY_COLLECTION_HOME, 'false');
    // }
    // this.stateService.save(StateService.STATE_KEY_TOPIC_SEARCH_LOADING, isLoading.toString());
  }

  ngOnInit(): void {
    this.endecapodService.setName('DemoEndecaService');
    this.endecapodService.setURL("/endecapod", "/endecapod/my");
    this.endecapodService.Result()
    .subscribe(res => {
      console.log("res", res);
      this.searchResult = res;
      
      of(this.searchResult['result']['records'])
      .pipe(
        switchMap(records => from(records)),
        map(records => records['records'][0]['properties']),
        toArray()
      )
      .subscribe( sub => {
        console.log("sub", sub);
        this.endecaRecordsUser = sub;
        console.log("endecoRecords", this.endecaRecordsUser);
      })
  
    })
  }

  private loadInitQuery() {
    this.endecapodService.setName('DemoEndecaService');
    this.endecapodService.setURL("/endecapod", "/endecapod/my");
    this.endecapodService.setSubscriptionAwareness(true);
    this.endecapodService.RegisterParams(this.urlSerializer.parse(`?Ns=sort_date_common|1&N=3+10&Ne=7487&Nu=global_rollup_key&Np=2`).queryParamMap);
    this.endecapodService.SetNe([7742]);
  }


  doSearch(id?: number, reset = false){
    this.dirty = true;
    this.endecaRecordsUser = [];
    if(reset){
      this.id = id;
      this.endecapodService.SetN([3, 10, this.id]);
      this.offset = 0;
    }
    console.log("doSearch id", this.id);
    console.log("doSearch offset", this.offset);
    this.endecapodService.Paginate(this.offset);
    this.endecapodService.DoSearch();
  }

  next(){
    this.endecapodService.Paginate(this.offset);
    this.offset = this.offset + 10;
    this.doSearch(this.id);
  }

  previous(){
    this.endecapodService.Paginate(this.offset);
    if(this.offset - 10 < 0) {
      this.offset = 0;
    } else {
      this.offset = this.offset - 10;
    }
    this.doSearch(this.id);
  }
}

