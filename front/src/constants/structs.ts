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
  last_seen: string;
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
}

export interface FriendsViewData {
  allUsers: UserInfo[];
  allFriends: Friend[];
  onlineFriends: Friend[];
  recvRequest: RequestInfo[];
  sendRequest: RequestInfo[];
}
