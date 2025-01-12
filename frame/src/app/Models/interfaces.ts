export interface CustomerInfo {
  firstName: string;
  lastName: string;
}

export interface OrderDetail {
  orderNumber: string;
  date: string;
  total: number;
}

export interface OrderResponse {
  customerInfo: CustomerInfo;
  orders: OrderDetail[];
}

export interface ProductEntry {
  file: File | null;
  price: number | null;
  isValid: boolean;
}

export interface UploadEntry {
  file: File | null;
  price: number | null;
  isValid: boolean;
}

export interface CartItem {
  pictureID: number;
  nGalleryImage?: string;
  sGalleryImage?: string;
  aGalleryImage?: string;
  price: number;
  quantity: number;
  type?: string;
  status?: string;
}

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

