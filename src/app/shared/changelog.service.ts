import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

const CURRENT_CHANGE_LOCAL_STORAGE_KEY = "last_pydt_change_num";

export type Changelog = {
  version?: string;
  date: string;
  desc: string;
};

const CLIENT_CHANGES: Changelog[] = [
  {
    version: "2.1.1",
    date: "2023-01-10",
    desc: `A quick hotfix release to fix an issue with the taskbar icon duplicating endlessly. Also including a small commit I missed in the last release because I hadn't pushed it from another computer that shows the current round in the game header.`,
  },
  {
    version: "2.1.0",
    date: "2023-01-10",
    desc: `It's been a long time since I did a client release, but not a lot in here other than version bumps and a couple small things:

- Multiple user support: You can now switch between multiple user tokens in the client with the new User menu.
- Proton/Steam Deck: I still don't think things are great on the steam deck, but I added better detection for proton installations (used by steam deck).
- Fixed a bug with the game store dropdown not displaying the saved selections correctly.`,
  },
  {
    version: "2.0.2",
    date: "2022-02-13",
    desc: `There's no real changes in this release - the 2.0.0 release wasn't able to upgrade 1.6.0 windows to 2.0.0 because of the change in updater/installer format.  This release fakes an upgrade in the old format (playyourdamnturn-2.0.2-full.nupkg and RELEASES), which really just contains the new installer.  The new installer runs, and the PYDT client will check for the old client on startup and run the uninstaller to get rid of it.  See here if you're interested in the details: https://github.com/electron-userland/electron-builder/issues/837#issuecomment-614127460.

(2.0.1 was deleted because I fixed a bug preventing the app from closing when you pressed the update button)
    
Duplicating the note from 2.0.0: **IF YOU USE START CLIENT ON BOOT** you'll need to uncheck the box in settings, save, and then recheck the box because the actual location of the app on the hard drive has changed.`,
  },
  {
    version: "2.0.0",
    date: "2022-02-05",
    desc: `This release is mostly digging out of a lot of technical debt, cleaning things up and getting updated to current versions of everything.  The biggest change is changing how updates on Windows are handled - we were using an old, deprecated installer format (Squirrel.Windows) and this release switches to the current recommended installer, NSIS.  I'm hoping this changeover will be transparent, but it's possible you'll need to manually uninstall/reinstall if you have issues. 🤞 

Because of this, **IF YOU USE START CLIENT ON BOOT** you'll need to uncheck the box in settings, save, and then recheck the box because the actual location of the app on the hard drive has changed.
    
**UPDATE:** Windows auto update from 1.6.0 to 2.0.0 isn't working, I'll be releasing 2.0.1 next weekend (2/12ish) that will support auto update from 1.6.0.`,
  },
  {
    version: "1.6.0",
    date: "2020-11-21",
    desc: `A bunch of bugfixes & features (thanks @Valamas for keeping the backlog full), and also getting the client synced up with some improvements from the website.

#23: background turn download (disabled by default, enable in the settings menu, if it doesn't cause a lot of issues I'll make it the default behavior in the future)
#24: cleaned up window close/tray behavior
#37: allow cancelling downloads/uploads
#44: sort turns by: your turn/smack talk/other, sort within by last update`,
  },
];

const WEBSITE_CHANGES: Changelog[] = [
  {
    date: "2023-02-16",
    desc: `Add support for Rulers of the Sahara DLC.`,
  },
  {
    date: "2023-01-28",
    desc: `Add support for Rulers of China DLC.`,
  },
  {
    date: "2023-01-10",
    desc: `You now have the ability to subscribe to receive email notifications when games are added.  Go to the Email Notifications tab in Your Profile to set it up!`,
  },
  {
    date: "2023-01-09",
    desc: `- Added the ability to restart or clone a game.  Both of these features are available in the game admin tools tab.  Restarting a game is only available during the first two rounds to be able to fix game issues without re-lobbying.  Cloning a game is available to recreate a game for rematches.
- Instead of just an option for "Random Only", you can now force users to choose a leader, choose random, or neither.
- Added an option to allow duplicate leaders.
- The admin can set user civs and boot users before game start in the user detail popup.`,
  },
  {
    date: "2022-12-20",
    desc: `Add support for Great Commanders DLC.`,
  },
  {
    date: "2022-11-24",
    desc: `Add support for Great Negotiators DLC.`,
  },
  {
    date: "2022-09-30",
    desc: `Civ 6 turn timers are enabled!  Thanks to <a href="https://discourse.playyourdamnturn.com/t/fixed-turn-timer/63/7" target="blank">bestander</a> for pointing us in the right direction on the forum.`,
  },
  {
    date: "2022-03-26",
    desc: `I'm allowing editing more fields on the first turn submission now to prevent re-lobbies because of bad game settings.`,
  },
  {
    date: "2021-09-25",
    desc: `Support for <a href="https://mohawkgames.com/oldworld/" target="blank">Old World</a>, a great new turn based 4X game!`,
  },
];

@Injectable()
export class ChangelogService {
  unviewedChanges$ = new BehaviorSubject(0);

  totalChanges = CLIENT_CHANGES.length + WEBSITE_CHANGES.length;

  constructor() {
    this.updateUnviewedChanges();
  }

  get clientChanges() {
    return CLIENT_CHANGES;
  }

  get websiteChanges() {
    return WEBSITE_CHANGES;
  }

  setChangesViewed() {
    localStorage.setItem(CURRENT_CHANGE_LOCAL_STORAGE_KEY, this.totalChanges.toString());
    this.updateUnviewedChanges();
  }

  private updateUnviewedChanges() {
    setTimeout(() => {
      this.unviewedChanges$.next(
        this.totalChanges - parseInt(localStorage.getItem(CURRENT_CHANGE_LOCAL_STORAGE_KEY) || "0", 10),
      );
    }, 10);
  }
}
