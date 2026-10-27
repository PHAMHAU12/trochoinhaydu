export type GameMode = 
  | 'CHALLENGE_ZONE'    // Ai rơi vào ô đỏ sẽ bị gọi trả bài / thử thách
  | 'LUCKY_ZONE'        // Ai rơi vào ô vàng sẽ nhận quà / điểm cộng
  | 'LAST_LANDER'       // Người chạm đất cuối cùng
  | 'FIRST_LANDER';     // Người chạm đất đầu tiên

export type MapTheme = 'TROPICAL_ISLAND' | 'CYBER_CITY' | 'COUNTRYSIDE' | 'COSMIC_SPACE';

export interface GroundZone {
  id: string;
  name: string;
  type: 'SAFE' | 'CHALLENGE' | 'LUCKY' | 'WATER';
  startRatio: number; // 0 to 1 across screen width
  endRatio: number;   // 0 to 1 across screen width
  color: string;
  label: string;
  sublabel: string;
}

export interface PlayerInput {
  id: string;
  name: string;
  avatarIndex: number;
  color: string;
}

export interface SavedClass {
  id: string;
  name: string;
  description: string;
  names: string[];
  updatedAt?: number;
}


export interface ParachuteEntity {
  id: string;
  name: string;
  avatarIndex: number;
  color: string;
  
  // Physics coordinates & speed
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetVy: number;
  
  // Visual states
  parachuteOpen: boolean;
  openProgress: number; // 0 to 1
  swingAngle: number;   // Pendulum swing angle in radians
  swingSpeed: number;
  
  // Landing state
  landed: boolean;
  landedX: number;
  landedTime?: number;
  landedZone?: GroundZone;
  rank?: number;
  
  // Special status (updrafted, turbulence)
  inThermal: boolean;
  thermalCooldown: number;
}

export interface GameSettings {
  mode: GameMode;
  theme: MapTheme;
  targetCount: number; // Số người cần chọn (ví dụ 1 người, 2 người)
  windLevel: 'CALM' | 'BREEZE' | 'GUSTY'; // Gió
  allowThermals: boolean; // Cột khí nóng bất ngờ
  fallSpeedMultiplier: number; // 1, 1.5, 2, 4
  soundEnabled: boolean;
}

export interface RoundResult {
  id: string;
  timestamp: number;
  mode: GameMode;
  theme: MapTheme;
  chosenPlayers: {
    player: PlayerInput;
    zone?: GroundZone;
    reason: string;
  }[];
  allLandings: {
    name: string;
    zoneName: string;
    zoneType: string;
    landTimeSec: number;
  }[];
}
