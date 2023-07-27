import { ObjectId } from "mongoose";

type AllMenusType = {
  remainingMenus: number;
  menus: Array<{
    _id: string;
    name: string;
    coverImage: string;
    position: number;
    templateId: number;
    restaurantId: string;
    isPublished: boolean;
    categoryCount: number;
    productCount: number;
    remainingProductCount: number;
  }>;
};

export default AllMenusType;
