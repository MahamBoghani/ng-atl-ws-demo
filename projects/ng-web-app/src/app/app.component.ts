import {Component, ElementRef, ViewChild} from '@angular/core';
import {WebSocketSubject, webSocket} from 'rxjs/websocket';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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
    postLikeCount: { label: 'Post Liked', count: 0 },
    postCount: { label: 'Posts', count: 0 },
    donationCount: { label: 'Donations', count: 0 }
  };

  form: FormGroup;
  icon = 'account_circle';
  iconOptions = ['android', 'motorcycle', 'pets', 'sentiment_satisfied_alt', 'insert_emoticon', 'flare', 'filter_vintage', 'wb_sunny', 'ac_unit', 'spa', 'whatshot'];
  id = 0;
  likes = 0;
  chartData = [];
  postStatMessage = '0 messages';
  donationStatMessage = '0 good deeds <3';

  constructor(private readonly fb: FormBuilder) {
    this.socket$ = webSocket('wss://ws-express.herokuapp.com/');

    this.socket$
      .subscribe(
        (message) => {
          this.processMessage(message);
          },
        (err) => {console.error('closed and retrying!', err); this.retry();},
        () => console.warn('Completed!')
      );

    this.createForm();
  }

  retry() {
    this.socket$ = webSocket('wss://ws-express.herokuapp.com/');

    this.socket$
      .subscribe(
        (message) => {
          this.processMessage(message);
        },
        // (err) => {console.error('closed and retrying!', err); this.retry();},
        () => console.warn('Completed!')
      );

  }

  updatePostStatMessage() {
    if (this.stats.postCount.count) {
      this.postStatMessage = this.stats.postCount.count === 1 ? this.stats.postCount.count + ' message' : this.stats.postCount.count + ' messages';
    }
  }

  updateDonationStatMessage() {
    if (this.stats.donationCount.count) {
      this.donationStatMessage = this.stats.donationCount.count === 1 ? this.stats.donationCount.count + ' good deed :)' : this.stats.donationCount.count + '  good deeds :)';
    }
  }

  updatePieData() {
    this.chartData = Object.keys(this.stats)
      .map(key => {
        return {
          name: this.stats[key].label,
          value: this.stats[key].count };})
      .filter(stat => stat.name !== 'Posts');
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      text: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.dirty) {
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
        this.stats.donationCount.count = message.stats.donationCount;
        this.serverMessages = message.posts;
        this.updatePieData();
        this.updatePostStatMessage();
        this.updateDonationStatMessage();
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
        break;
      case 'message_post':
        this.stats.postCount.count = message.stats.postCount;
        this.serverMessages.push(message.message);
        this.updatePostStatMessage();
        break;
      case 'donate_stat':
        this.stats.donationCount.count = message.stats.donateCount;
        this.updatePieData();
        this.updateDonationStatMessage();
        break;
      default:
        console.error('Message not processed');
        break;
    }
  }

  onRandomAvatarClick() {
    let message = {type: 'random_avatar'};
    this.socket$.next(message);

    this.icon = this.iconOptions[(Math.ceil(Math.random() * this.iconOptions.length)) - 1];
  }

  onPostLike(id: number) {
    let message = {type: 'post_like', id: id};
    this.socket$.next(message);
  }

  onDonate() {
    let message = {type: 'donate'};
    this.socket$.next(message);
  }
}
