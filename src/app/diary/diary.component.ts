import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FroalaViewModule } from 'angular-froala-wysiwyg';
import * as he from 'he';
import * as moment from 'moment';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { FroalaEditorDirective } from 'angular-froala-wysiwyg/editor/editor.directive';
import { FroalaEditorModule } from 'angular-froala-wysiwyg/editor/editor.module';
import { DiaryEntry } from '../model/diary-entry.model';

@Component({
  selector: 'app-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.scss'],
  animations: [
    trigger('calendarAnimation', [
      state('show', style({
        transform: 'translateY(0%)',
      })),
      state('previous',   style({
        transform: 'translateY(-100%)',
      })),
      state('next',   style({
        transform: 'translateY(100%)',
      })),
      transition('previous => next', animate('0ms')),
      transition('next => previous', animate('0ms')),
      transition('* => *', animate('200ms ease')),
    ])
  ]
})

export class DiaryComponent implements OnInit {
  readonly numberOfHistoryEntriesToShow = 5;

  calendarAnimation = 'show';
  currentLog: DiaryEntry;
  currentDate: Date;
  historyEntries: DiaryEntry[] = [];
  froalaOptions = {
    toolbarInline: true,
    charCounterCount: false,
    placeholderText: '',
    quickInsertButtons: [''],
    quickInsertTags: [''],
    videoResize: false,
    videoEditButtons: ['videoReplace', 'videoAlign', 'videoRemove'],
    imageResize: false,
    imageEditButtons: ['imageReplace', 'imageAlign', 'imageLink', 'imageRemove'],
    toolbarButtons: [
      'bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL',
      'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insertVideo', 'undo', 'redo'
    ],
    events : {
      'froalaEditor.contentChanged' : (e, editor) => {
        if (this.currentLog && this.currentLog.content !== editor.html.get()) {
          this.updateContent(editor.html.get());
        }
      }
    }
  };

  constructor() { }

  ngOnInit() {
    this.currentDate = moment(new Date().toJSON().slice(0, 10)).toDate();
    this.loadCurrentLogEntry();
  }

  private loadCurrentLogEntry() {
    this.loadLogEntry();
    this.loadHistory();
  }

  private loadLogEntry() {
    this.currentLog = new DiaryEntry(this.currentDate);
  }

  private loadHistory() {
      this.historyEntries = [];
      for (let i = 0; i < 5; i++) {
        const date = moment(this.currentLog.date).subtract(i + 1, 'days').toDate();
        const history = new DiaryEntry(date);
        this.historyEntries.push(history);
      }
  }

  private updateContent(content: string) {
    this.currentLog.content = content;
  }

  parseHTML(html: string) {
    const stripedHtml = html.replace(/<[^>]+>/g, '');
    return he.decode(stripedHtml);
  }

  changeDay(days: number) {
    const newDate = moment(this.currentDate).add(days, 'days').toDate();
    this.changeDateWithAnimation(newDate);
  }

  changeDateWithAnimation(newDate: Date) {
    const animateToNext = moment(newDate).isAfter(this.currentDate);
    this.hideDateAnimation(animateToNext, newDate);
    this.showDateAnimation(animateToNext, newDate);
  }

  private hideDateAnimation(animateToNext: boolean, newDate: Date) {
    this.calendarAnimation = animateToNext ? 'next' : 'previous';
  }

  private showDateAnimation(animateToNext: boolean, newDate: Date) {
    setTimeout(() => {
      // Place the element to its original position before display
      this.calendarAnimation = animateToNext ? 'previous' : 'next';
      this.updateDateAndLogEntry(newDate);
      setTimeout(() => this.calendarAnimation = 'show', 50);
    }, 200);
  }

  private updateDateAndLogEntry(date: Date) {
    this.currentDate = date;
    this.loadLogEntry();
    this.loadHistory();
  }

  getFrenchDate(date: Date, includeWeekday = true) {
    let options: any;
    if (includeWeekday) {
      options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    } else {
      options = { year: 'numeric', month: 'long', day: 'numeric' };
    }
    return date.toLocaleDateString('fr-FR', options);
  }

  getMonth(date: Date) {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aôut', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[date.getMonth()];
  }

  isToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return moment(this.currentDate).isSame(moment(today), 'day');
  }
}
