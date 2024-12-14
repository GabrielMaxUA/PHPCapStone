export interface User {
  customerID?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  dob?: Date;
  status?: string;
  type?: string;
  orderDetailsID?: number;
  cardID?: number;
  created_at?: Date;
  //same format (string, boolean, number) variables as in thedatabase they are related to
 }