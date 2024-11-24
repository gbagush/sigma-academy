export interface Id {
  $oid: string;
}

export interface Date {
  $date: string;
}

export interface User {
  _id: Id;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password?: string;
  registerAt: Date;
}
