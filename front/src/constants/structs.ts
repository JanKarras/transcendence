export interface UserStats {
  wins: number;
  loses: number;
  tournamentWins: number;
}

export interface Friend {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  wins: number;
  loses: number;
  tournamentWins: number;
  path: string;
  last_seen: string;
}

export interface UserInfo {
  username: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  path: string;
}

export interface UserResponse {
  user: UserInfo;
  friends: Friend[];
  stats: UserStats & { user_id: number };
}
