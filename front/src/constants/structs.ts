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
  path: string | null
}

export interface UserInfo {
  username: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  path: string | null;
}

export interface UserResponse {
  user: UserInfo;
  friends: Friend[];
  stats: UserStats & { user_id: number };
}
