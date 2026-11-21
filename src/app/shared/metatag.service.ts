import { Injectable, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

@Injectable()
export class MetatagService {
  private title = inject(Title);
  private meta = inject(Meta);

  setTitleAndDesc(title: string, desc?: string) {
    this.title.setTitle(`${title} | Play Your Damn Turn`);

    if (desc) {
      this.meta.updateTag({ name: "description", content: desc });
    } else {
      this.meta.removeTag("name='description'");
    }
  }
}
