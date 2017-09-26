/**
 * Created by liuzheng on 2017/8/30.
 */
import {Injectable, NgModule} from '@angular/core';
import {Http} from '@angular/http';
import {Cookie} from 'ng2-cookies/ng2-cookies';
import {Logger} from 'angular2-logger/core';
import 'rxjs/add/operator/map';

declare let jQuery: any;
// declare var Clipboard: any;
import * as io from 'socket.io-client';
// declare let io: any;
// declare var layer: any;
// @Injectable()
// export class Logger {
//   logs: string[] = []; // capture logs for testing
//   log(message: string) {
//     this.logs.push(message);
//     console.log(message);
//   }
// }
import {Router} from '@angular/router';


// export class User {
//   id: number;
//   name: string;
//   username: string;
//   password: string;
//   phone: string;
//   avatar: string;
//   role: string;
//   email: string;
//   is_active: boolean;
//   date_joined: string;
//   last_login: string;
//   groups: Array<string>;
// }
export class Group {
  id: number;
  name: string;
  membercount: number;
  comment: string;
}

export let User: {
  id: number;
  name: string;
  username: string;
  password: string;
  phone: string;
  avatar: string;
  role: string;
  email: string;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  groups: Array<Group>;
  logined: boolean;
} = {
  id: 0,
  name: 'nobody',
  username: '',
  password: '',
  phone: '',
  avatar: '',
  role: '',
  email: '',
  is_active: false,
  date_joined: '',
  last_login: '',
  groups: [],
  logined: false,
};

export class Term {
  nick: string;
  edit: boolean;
  machine: string;
  connected: boolean;
  closed: boolean;
  socket: any;
  term: any;
  hide: boolean;
}

export let DataStore: {
  socket: any;
  Nav: Array<{}>;
  lastNavigationAttempt: string;
  route: Array<{}>;
  activenav: {};
  Path: {};
  error: {};
  msg: {};
  leftbar: string;
  leftbarrightclick: string;
  loglevel: number;
  term: Array<Term>;
  termActive: number;
  leftbarhide: boolean;
  termlist: Array<string>;
  windowsize: Array<number>;
} = {
  socket: io.connect(),
  Nav: [{}],
  lastNavigationAttempt: '',
  route: [{}],
  activenav: {},
  Path: {},
  error: {},
  msg: {},
  leftbar: '/api/leftbar',
  leftbarrightclick: '/api/leftbarrightclick',
  loglevel: 0,
  term: [new Term()],
  termActive: 0,
  leftbarhide: false,
  termlist: [],
  windowsize: [],
};


@Injectable()
export class AppService {
  // user:User = user  ;
  // searchrequest: any;

  constructor(private http: Http,
              private _router: Router,
              private _logger: Logger) {
    if (Cookie.get('loglevel')) {

      // 0.- Level.OFF
      // 1.- Level.ERROR
      // 2.- Level.WARN
      // 3.- Level.INFO
      // 4.- Level.DEBUG
      // 5.- Level.LOG
      this._logger.level = parseInt(Cookie.get('loglevel'), 10);
      // this._logger.debug('Your debug stuff');
      // this._logger.info('An info');
      // this._logger.warn('Take care ');
      // this._logger.error('Too late !');
      // this._logger.log('log !');
    } else {
      Cookie.set('loglevel', '0', 99, '/', document.domain);
      // this._logger.level = parseInt(Cookie.getCookie('loglevel'));
      this._logger.level = 0;
    }
    DataStore.socket.on('connect', function () {
      console.log('DatsStore socket connected');
      DataStore.socket.on('nav', function (data) {
        DataStore.Nav = JSON.parse(data);
      });
      DataStore.socket.on('leftbar', function (data) {
      });
      // DataStore.socket.on('popup', function (data) {
      //   layer.msg(data);
      // });

      // DataStore.socket.emit('api', 'all');
    });
    this.checklogin();
  }


  checklogin() {
    this._logger.log('service.ts:AppService,checklogin');
    if (DataStore.Path) {
      if (DataStore.Path['name'] === 'FOF' || DataStore.Path['name'] === 'Forgot') {
      } else {
        if (User.logined) {
          if (document.location.pathname === '/login') {
            this._router.navigate(['']);
          } else {
            this._router.navigate([document.location.pathname]);
          }
          // jQuery('angular2').show();
        } else {
          this.http.get('/api/checklogin')
            .map(res => res.json())
            .subscribe(
              data => {
                User.name = data.name;
                User.username = data.username;
                User.logined = data.logined;
                this._logger.debug(User);
              },
              err => {
                this._logger.error(err);
                User.logined = false;
                this._router.navigate(['login']);
              },
              () => {
                if (User.logined) {
                  if (document.location.pathname === '/login') {
                    this._router.navigate(['']);
                  } else {
                    this._router.navigate([document.location.pathname]);
                  }
                } else {
                  this._router.navigate(['login']);
                }
                // jQuery('angular2').show();
              }
            );
        }
      }
    } else {
      this._router.navigate(['FOF']);
      // jQuery('angular2').show();
    }
  }

  login() {
    this._logger.log('service.ts:AppService,login');
    DataStore.error['login'] = '';
    this._logger.log(User);
    if (User.username.length > 0 && User.password.length > 6 && User.password.length < 100) {
      this.http.post('/api/checklogin', JSON.stringify(User)).map(res => res.json())
        .subscribe(
          data => {
            User.logined = data.logined;
            User.name = data.name;
            User.username = data.username;
            User.logined = data.logined;
          },
          err => {
            this._logger.error(err);
            User.logined = false;
            this._router.navigate(['login']);
            DataStore.error['login'] = '后端错误,请重试';
            return '后端错误,请重试';
          },
          () => {
            if (User.logined) {
              if (jQuery.isEmptyObject(DataStore.Path)) {
                this._router.navigate(['welcome']);
              } else {
                this._router.navigate([DataStore.Path['name'], DataStore.Path['res']]);
              }
            } else {
              this._router.navigate(['login']);
              DataStore.error['login'] = '请检查用户名和密码';
              return '请检查用户名和密码';
            }
            // jQuery('angular2').show();

          });
    } else {
      DataStore.error['login'] = '请检查用户名和密码';
      return '请检查用户名和密码';
    }
  }

//
//
//   HideLeft() {
//     DataStore.leftbarhide = true;
//
//     DataStore.Nav.map(function (value, i) {
//       for (var ii in value['children']) {
//         if (DataStore.Nav[i]['children'][ii]['id'] === 'HindLeftManager') {
//           DataStore.Nav[i]['children'][ii] = {
//             'id': 'ShowLeftManager',
//             'click': 'ShowLeft',
//             'name': 'Show left manager'
//           };
//         }
//       }
//     });
//
//   }
//
//   ShowLeft() {
//     DataStore.leftbarhide = false;
//
//     DataStore.Nav.map(function (value, i) {
//       for (var ii in value['children']) {
//         if (DataStore.Nav[i]['children'][ii]['id'] === 'ShowLeftManager') {
//           DataStore.Nav[i]['children'][ii] = {
//             'id': 'HindLeftManager',
//             'click': 'HideLeft',
//             'name': 'Hind left manager'
//           };
//         }
//       }
//     });
//
//
//   }
//

//     setMyinfo(user:User) {
//         // Update data store
//         this._dataStore.user = user;
//         this._logger.log("service.ts:AppService,setMyinfo");
//         this._logger.debug(user);
// // Push the new list of todos into the Observable stream
// //         this._dataObserver.next(user);
//         // this.myinfo$ = new Observable(observer => this._dataObserver = observer).share()
//     }
//
//   getMyinfo() {
//     this._logger.log('service.ts:AppService,getMyinfo');
//     return this.http.get('/api/userprofile')
//       .map(res => res.json())
//       .subscribe(response => {
//         DataStore.user = response;
//         // this._logger.warn(this._dataStore.user);
//         // this._logger.warn(DataStore.user)
//       });
//   }
//
//   getUser(id: string) {
//     this._logger.log('service.ts:AppService,getUser');
//     return this.http.get('/api/userprofile')
//       .map(res => res.json());
//   }
//
//   gettest() {
//     this._logger.log('service.ts:AppService,gettest');
//     this.http.get('/api/userprofile')
//       .map(res => res.json())
//       .subscribe(res => {
//         return res;
//       });
//   }
//
//   getGrouplist() {
//     this._logger.log('service.ts:AppService,getGrouplist');
//     return this.http.get('/api/grouplist')
//       .map(res => res.json());
//   }
//
//   getUserlist(id: string) {
//     this._logger.log('service.ts:AppService,getUserlist');
//     if (id)
//       return this.http.get('/api/userlist/' + id)
//         .map(res => res.json());
//     else
//       return this.http.get('/api/userlist')
//         .map(res => res.json());
//   }
//
//   delGroup(id) {
//
//   }
//
//
//   copy() {
//     var clipboard = new Clipboard('#Copy');
//
//     clipboard.on('success', function (e) {
//       console.info('Action:', e.action);
//       console.info('Text:', e.text);
//       console.info('Trigger:', e.trigger);
//
//       e.clearSelection();
//     });
//     console.log('ffff');
//     console.log(window.getSelection().toString());
//
//     var copy = new Clipboard('#Copy', {
//       text: function () {
//         return window.getSelection().toString();
//       }
//     });
//     copy.on('success', function (e) {
//       layer.alert('Lucky Copyed!');
//     });
//
//   }
//
//   // getMachineList() {
//   //     this._logger.log('service.ts:AppService,getMachineList');
//   //     return this.http.get('/api/leftbar')
//   //         .map(res => res.json())
//   //         .subscribe(response => {
//   //             DataStore.leftbar = response;
//   //             this._logger.debug("DataStore.leftbar:", DataStore.leftbar)
//   //
//   //             // this._logger.warn(this._dataStore.user);
//   //             // this._logger.warn(DataStore.user)
//   //         });
//   // }
//   //
//   // getLeftbarRightclick() {
//   //     this._logger.log('service.ts:AppService,getLeftbarRightclick');
//   //     return this.http.get('/api/leftbarrightclick')
//   //         .map(res => res.json())
//   //         .subscribe(response => {
//   //             DataStore.leftbarrightclick = response;
//   //             this._logger.debug("DataStore.leftbarrightclick:", DataStore.leftbarrightclick)
//   //             // this._logger.warn(this._dataStore.user);
//   //             // this._logger.warn(DataStore.user)
//   //         });
//   //
//   // }


//
//   Search(q) {
//     if (this.searchrequest) {
//       this.searchrequest.unsubscribe();
//     }
//     this.searchrequest = this.http.get('/api/search?q=' + q)
//       .map(res => res.json())
//       .subscribe(
//         data => {
//           this._logger.log(data);
//         },
//         err => {
//           this._logger.error(err);
//         },
//         () => {
//         }
//       );
//     this._logger.log(q);
//   }
}

// }
//
// @Pipe({
//     name: 'join'
// })
//
// export class Join {
//     transform(value, args?) {
//         if (typeof value === 'undefined')
//             return 'undefined';
//         return value.join(args)
//     }
// }