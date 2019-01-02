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
  clearCount = 0;
  postCount = 0;
  randomAvatarCount = 0;
  postLikeCount = 0;
  form: FormGroup;
  icon = 'account_circle';
  iconOptions = ['android', 'motorcycle', 'pets', 'sentiment_satisfied_alt', 'insert_emoticon', 'flare', 'filter_vintage', 'wb_sunny', 'ac_unit', 'spa', 'whatshot'];
  id = 0;
  likes = 0;

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
        this.clearCount = message.stats.clearCount;
        this.randomAvatarCount = message.stats.randomAvatarCount;
        this.serverMessages = message.posts;
        break;
      case 'updated_clear_stats':
        this.clearCount = message.stats.clearCount;
        break;
      case 'updated_avatar_stats':
        this.randomAvatarCount = message.stats.randomAvatarCount;
        break;
      case 'updated_post_like_stats':
        this.postLikeCount = message.stats.postLikeCount;
        let messIndex = this.serverMessages.findIndex(mess => mess.id === message.likedMessage);
        ++this.serverMessages[messIndex].likes;
        break;
      case 'message_post':
        this.postCount = message.stats.postCount;
        this.serverMessages.push(message.message);
        console.log('new message: ', message);
        break;
      case 'wip':
        this.clearCount = 99;
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
