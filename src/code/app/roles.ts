export interface IGroupRole {
  id: string;
  name: string;
  rank: number;
  permissions: {
    manageOwnRank: boolean;
    manageLowerRanks: boolean;

    editGroupSettings: boolean;
    editPages: boolean;
  };
  description: string;
}

export const roles: IGroupRole[] = [
  {
    id: 'owner',

    name: 'Owner',

    rank: 500,
    permissions: {
      manageOwnRank: true,
      manageLowerRanks: true,

      editGroupSettings: true,
      editPages: true,
    },

    description: 'Manages everyone in the group',
  },
  {
    id: 'admin',

    name: 'Admin',

    rank: 400,
    permissions: {
      manageOwnRank: true,
      manageLowerRanks: true,

      editGroupSettings: true,
      editPages: true,
    },

    description: 'Autonomous role. Manages everyone, except the owner(s)',
  },
  {
    id: 'moderator',

    name: 'Moderator',

    rank: 300,
    permissions: {
      manageOwnRank: false,
      manageLowerRanks: true,

      editGroupSettings: false,
      editPages: true,
    },

    description: 'Manages members and viewers of the group',
  },
  {
    id: 'member',

    name: 'Member',

    rank: 200,
    permissions: {
      manageOwnRank: false,
      manageLowerRanks: false,

      editGroupSettings: false,
      editPages: true,
    },

    description: 'Can see and edit pages',
  },
  {
    id: 'viewer',

    name: 'Viewer',

    rank: 100,
    permissions: {
      manageOwnRank: false,
      manageLowerRanks: false,

      editGroupSettings: false,
      editPages: false,
    },

    description: 'Can see pages, but not edit them',
  },
];

export const rolesMap = roles.reduce((acc, role) => {
  acc[role.id] = role;
  return acc;
}, {} as Record<string, IGroupRole>);
