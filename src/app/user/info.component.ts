import { Component, Input, OnInit } from '@angular/core';
import { ProfileCacheService, SteamProfile, User } from 'pydt-shared';
import { Utility } from '../shared/utility';

@Component({
  selector: 'pydt-user-info',
  templateUrl: './info.component.html'
})
export class UserInfoComponent implements OnInit {
  @Input() user: User;
  profile: SteamProfile;

  constructor(private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.profileCache.getProfiles([this.user.steamId]).then(result => {
      this.profile = result[this.user.steamId];
    });
  }

  averageTurnTime() {
    const avgTurnTime = this.user.timeTaken / (this.user.turnsPlayed + this.user.turnsSkipped);
    return Utility.countdown(0, avgTurnTime);
  }
}
