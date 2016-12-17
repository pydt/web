import { Component, Input, OnInit } from '@angular/core';
import { ProfileCacheService, SteamProfile, User } from 'pydt-shared';
import * as countdown from 'countdown';

@Component({
  selector: 'pydt-user-info',
  templateUrl: './info.component.html'
})
export class UserInfoComponent implements OnInit {
  @Input() user: User;
  private profile: SteamProfile;

  constructor(private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.profileCache.getProfiles([this.user.steamId]).then(result => {
      this.profile = result[this.user.steamId];
    });
  }

  averageTurnTime() {
    const avgTurnTime = this.user.timeTaken / (this.user.turnsPlayed + this.user.turnsSkipped);
    return countdown(0, avgTurnTime, countdown.DAYS | countdown.HOURS | countdown.MINUTES);
  }
}
