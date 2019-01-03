import {Component, ElementRef, ViewChild} from '@angular/core';
import {WebSocketSubject, webSocket} from 'rxjs/websocket';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

export class Message {
  constructor(
    public sender: string,
    public content: string,
    public isBroadcast =  false
  ) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('postingInput') postingInput: ElementRef;

  private socket$: WebSocketSubject<any>;

  public serverMessages = [];
  stats = {
    clearCount: { label: 'Clear Post', count: 0 },
    randomAvatarCount: { label: 'Random Avatar', count: 0 },
    postLikeCount: { label: 'Like Post', count: 0 },
    postCount: { label: 'Posts', count: 0 },
  };

  form: FormGroup;
  icon = 'account_circle';
  iconOptions = ['android', 'motorcycle', 'pets', 'sentiment_satisfied_alt', 'insert_emoticon', 'flare', 'filter_vintage', 'wb_sunny', 'ac_unit', 'spa', 'whatshot'];
  id = 0;
  likes = 0;
  pieData = [];

  constructor(private readonly fb: FormBuilder) {
    this.socket$ = webSocket('ws://localhost:8999');

    this.socket$
      .subscribe(
        (message) => {
          console.log(`message came through, `, message);
          this.processMessage(message);
          // this.serverMessages.push(message); this.messageCount = message.messageCount;
          },
        (err) => console.error(err),
        () => console.warn('Completed!')
      );

    this.createForm();
  }

  updatePieData() {
    this.pieData = Object.keys(this.stats).map(key => {console.log(key); return {name: this.stats[key].label, value: this.stats[key].count };}).filter(stat => stat.name !== 'Posts');
    console.log(this.pieData);
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      text: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.dirty) {
      console.log('icon: ', this.icon);
      let message = {type: 'message_post', data: { id: ++this.id, post: this.form.getRawValue(), icon: this.icon, likes: this.likes } };
      this.socket$.next(message);
      this.form.reset();
      this.icon = 'account_circle';
    }
  }

  clearPost() {
    this.form.reset();

    this.trackClear();
  }

  trackClear(): void {
    let message = {type: 'clear_post'};
    this.socket$.next(message);
  }

  processMessage(message: any) {
    switch (message.type) {
      case 'initial_stats':
        this.stats.clearCount.count = message.stats.clearCount;
        this.stats.randomAvatarCount.count = message.stats.randomAvatarCount;
        this.stats.postCount.count = message.stats.postCount;
        this.stats.postLikeCount.count = message.stats.postLikeCount;
        this.serverMessages = message.posts;
        this.updatePieData();
        break;
      case 'updated_clear_stats':
        this.stats.clearCount.count = message.stats.clearCount;
        this.updatePieData();
        break;
      case 'updated_avatar_stats':
        this.stats.randomAvatarCount.count = message.stats.randomAvatarCount;
        this.updatePieData();
        break;
      case 'updated_post_like_stats':
        this.stats.postLikeCount.count = message.stats.postLikeCount;
        this.updatePieData();
        // let messIndex = this.serverMessages.findIndex(mess => mess.id === message.likedMessage);
        // ++this.serverMessages[messIndex].likes;
        break;
      case 'message_post':
        this.stats.postCount.count = message.stats.postCount;
        this.serverMessages.push(message.message);
        break;
      case 'wip':
        this.stats.clearCount.count = 99;
        break;
    }
  }

  onRandomAvatarClick() {
    let message = {type: 'random_avatar'};
    this.socket$.next(message);

    this.icon = this.iconOptions[(Math.ceil(Math.random() * this.iconOptions.length))];
  }

  onPostLike(id: number) {
    let message = {type: 'post_like', id: id};
    this.socket$.next(message);
  }
}
