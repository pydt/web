import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { BrowserDataService } from "./browser-data.service";

const CURRENT_CHANGE_LOCAL_STORAGE_KEY = "last_pydt_change_num";
const CLIENT_RELEASES_URL = "https://api.github.com/repos/pydt/client/releases?per_page=100";
const CLIENT_RELEASES_POLL_INTERVAL_MS = 60 * 60 * 1000;

export type Changelog = {
  version?: string;
  date: string;
  desc: string;
};

interface GithubRelease {
  // eslint-disable-next-line camelcase
  tag_name: string;
  // eslint-disable-next-line camelcase
  published_at: string;
  body: string;
  draft: boolean;
}

const WEBSITE_CHANGES: Changelog[] = [
  {
    date: "2026-06-25",
    desc: `### CIV7 HOTSEAT!
This is very beta and barely tested, but initial support for Civ 7 is in.  A mod is required to play, it blocks the screen after 1 turn to prevent accidentally moving on to the next player's turn, and also adds turn state to the save file (which is almost definitely somewhere in the file, but I've been unable to find it).
You can subscribe to the mod here: https://steamcommunity.com/sharedfiles/filedetails/?id=3751833377`,
  },
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

  private clientChangesList: Changelog[] = [];
  private clientChangesLoaded: Promise<void>;

  constructor(
    private http: HttpClient,
    private browserData: BrowserDataService,
  ) {
    if (this.browserData.isBrowser()) {
      this.clientChangesLoaded = this.loadClientChanges();
      setInterval(() => void this.loadClientChanges(), CLIENT_RELEASES_POLL_INTERVAL_MS);
    } else {
      this.clientChangesLoaded = Promise.resolve();
    }
  }

  get clientChanges() {
    return this.clientChangesList;
  }

  get websiteChanges() {
    return WEBSITE_CHANGES;
  }

  get totalChanges() {
    return this.clientChangesList.length + WEBSITE_CHANGES.length;
  }

  async setChangesViewed() {
    await this.clientChangesLoaded;

    localStorage.setItem(CURRENT_CHANGE_LOCAL_STORAGE_KEY, this.totalChanges.toString());
    this.updateUnviewedChanges();
  }

  private async loadClientChanges() {
    try {
      const releases = await this.http.get<GithubRelease[]>(CLIENT_RELEASES_URL).toPromise();

      this.clientChangesList = releases
        .filter(release => !release.draft && release.body)
        .map(release => ({
          version: release.tag_name.replace(/^v/, ""),
          date: release.published_at,
          desc: release.body,
        }));
    } catch {
      // If GitHub is unreachable, just show no client changes rather than breaking the page
    }

    this.updateUnviewedChanges();
  }

  private updateUnviewedChanges() {
    setTimeout(() => {
      const changeCount =
        this.totalChanges - parseInt(localStorage.getItem(CURRENT_CHANGE_LOCAL_STORAGE_KEY) || "0", 10);

      // Don't show negative numbers if loading client changes fails and the local storage value is higher than the total changes
      this.unviewedChanges$.next(changeCount > 0 ? changeCount : 0);
    }, 10);
  }
}
