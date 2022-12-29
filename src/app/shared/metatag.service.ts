import { Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

@Injectable()
export class MetatagService {
  constructor(private title: Title, private meta: Meta) {}

  setTitleAndDesc(title: string, desc?: string) {
    this.title.setTitle(`${title} | Play Your Damn Turn`);

    if (desc) {
      this.meta.updateTag({ name: "description", content: desc });
    } else {
      this.meta.removeTag("name='description'");
    }
  }
}
