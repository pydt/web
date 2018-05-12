export * from './AuthApi';
import { AuthApi } from './AuthApi';
export * from './GameApi';
import { GameApi } from './GameApi';
export * from './UserApi';
import { UserApi } from './UserApi';
export * from './WebhookApi';
import { WebhookApi } from './WebhookApi';
export const APIS = [AuthApi, GameApi, UserApi, WebhookApi];
