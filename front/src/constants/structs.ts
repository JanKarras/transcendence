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
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  path: string;
  last_seen: string;
  twofa_active: boolean;
}

export interface UserResponse {
  user: UserInfo;
  friends: Friend[];
  stats: UserStats & { user_id: number };
  requests?: {
    sent: RequestInfo[];
    received: RequestInfo[];
  };
}

export interface trans {
  ger: string;
  eng: string;
  nig: string;
}

export interface RequestInfo {
  id: number;
  type: string;
  receiver_username?: string;
  sender_username?: string;
  created_at: string;
  status: string;
}

export interface FriendsViewData {
  allUsers: UserInfo[];
  allFriends: Friend[];
  onlineFriends: Friend[];
  recvRequest: RequestInfo[];
  sendRequest: RequestInfo[];
}

export interface MatchHistoryEntry {
  matchId: number;
  type: "1v1_local" | "1v1_remote" | "tournament";
  tournamentId?: number | null;
  tournamentName?: string | null;
  round?: number | null;
  matchDate: string;
  players: {
    userId: number;
    username: string;
    score: number;
    rank?: number | null;
  }[];
}
