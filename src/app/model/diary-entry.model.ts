import * as uuid from 'uuid/v4';

export class DiaryEntry  {
    public id: string;
    public date: Date;
    public content: string;

    constructor(date?: Date) {
        this.content = '';
        this.date = date || null;
    }
}
