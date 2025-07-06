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
    version: "2.1.9",
    date: "2025-07-06",
    desc: `- A nice fix for showing the PYDT icon in the OSX menu bar (thanks @ccurtsinger) https://github.com/pydt/client/pull/79
- Fixed a bug with the game description not showing on the play turn screen, also removed the button to switch to game info and now just always showing everything`,
  },
  {
    version: "2.1.8",
    date: "2024-09-21",
    desc: "OSX Sequoia fix",
  },
  {
    version: "2.1.6",
    date: "2023-01-17",
    desc: `Very small release, a couple of bug fixes and an update to bring in the dead player icon.

- [Fix double link open](https://discourse.playyourdamnturn.com/t/double-open/8740/10)
- [Remove play save after submit](https://discourse.playyourdamnturn.com/t/save-file-not-being-removed/8674)`,
  },
  {
    version: "2.1.5",
    date: "2023-12-14",
    desc: `Library bumps and a couple small niceties:
- [Show more than hours](https://discourse.playyourdamnturn.com/t/client-shows-hours-since-last-turn-and-never-days/8087)
- [Show timer when playing](https://discourse.playyourdamnturn.com/t/display-timer-in-the-client-screen-when-waiting-for-the-save-to-be-uploaded/8084)
- [Congress Turn notification](https://discourse.playyourdamnturn.com/t/congress-turns/8079/3)
- Added some code so I could override the OSX Civ 6 save path, I think they introduced a bug in a recent release where the path is doubled up so it looks like "/Users/user/Library/Application Support/Sid Meier's Civilization VI/Sid Meier's Civilization VI/Saves/Hotseat" instead of just having one SMCVI directory.
`,
  },
  {
    version: "2.1.4",
    date: "2023-06-13",
    desc: `A fairly small release with some bug/feature requests:

- [Fix start minimized](https://discourse.playyourdamnturn.com/t/start-minimized-on-startup/832)
- [Unique archive files](https://discourse.playyourdamnturn.com/t/unique-archive-files/7390)
- [Clear unread smack talk](https://discourse.playyourdamnturn.com/t/option-to-dismiss-smack-talk-post-notifications-in-client/7860)
  
**NOTE:** Versions 2.1.2 and 2.1.3 were basically the same as this release, there were a couple things that needed to be hotfixed.`,
  },
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
    date: "2024-01-06",
    desc: `A few small changes made over the holidays (not as much as hoped, hopefully I can put in some more time soon):
- <a href="https://discourse.playyourdamnturn.com/t/fixed-how-can-i-change-my-token/9989" target="_blank">Tokens can now be revoked if you gave your token to someone else or something</a>
- <a href="https://discourse.playyourdamnturn.com/t/fixed-allow-players-with-500-turns-to-have-2-open-games/9378/2" target="_blank">If you have more than 500 turns you can have more than one open game, up to 10.  Hopefully there won't be any spam issues to make me reconsider this.</a>
- Log when a <a href="https://discourse.playyourdamnturn.com/t/keep-track-of-the-round-in-which-a-player-has-been-defeated/8796" target="_blank">player has been defeated</a> or <a href="https://discourse.playyourdamnturn.com/t/add-a-log-for-mod-changes-done-via-admin-tool/9161" target="_blank">mod has been changed with the admin mod tool</a>
- <a href="https://discourse.playyourdamnturn.com/t/read-only-access-for-mods-for-non-host-players/10059" target="_blank">Read only access to the mod tool for non-admins</a>
- Housecleaning with text for <a href="https://discourse.playyourdamnturn.com/t/turn-timer-clearer-option-descriptions/9352" target="_blank">turn timer descriptions</a> and <a href="https://discourse.playyourdamnturn.com/t/update-system-generated-post-for-new-game-masters/10282" target="_blank">new game smack talk posts</a>`,
  },
  {
    date: "2023-12-08",
    desc: `Added support for the ability to request a substitution in a game - games containing players that need substitution will be shown in the new "Substitution Requested" tab of the Open Games page.`,
  },
  {
    date: "2023-12-05",
    desc: `We're keeping much more detailed statistics on turn activity, which you can see pretty much anywhere turn stats are showed (global/game/user).  Now that we have this, I've added a new "Sort via Play Times" option when sorting players that will take into account their last 100 turns and sort appropriately, so people no longer have to bug Valamas all the time.`,
  },
  {
    date: "2023-07-05",
    desc: `When users are in vacation mode and a game has a turn timer, they will now be skipped at the end of the turn timer by default.  The game host can also choose to skip the user immediately or pause the game when a user is on vacation.`,
  },
  {
    date: "2023-06-20",
    desc: `Endgame changes (BETA): I've integrated <a href="https://github.com/viash-io/civ6_pipeline" target="_blank">this Civ 6 replay generator</a> into the game pipeline, it will take one image per turn and then create a video of the game when the game is "finalized" (less than 2 players remain in the game).  The image generation has been running in the background for about a month now, and any turns played before it started running won't be captured in the video.  Also, I've made a few bugfixes to the image generation (and I'm sure there's more things to find) so the video might not be great yet, but definitely let me know if you see issues with the videos.

Also, you can now download your previous turns from the turn history tab, and once the game is finalized you can download any player's turn (but PYDT only keeps the most recent 20 or so saves, so not that far back).`,
  },
  {
    date: "2023-03-30",
    desc: `Add support for the Rulers of England DLC.`,
  },
  {
    date: "2023-03-16",
    desc: `Add support for the Great Builders DLC.`,
  },
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
