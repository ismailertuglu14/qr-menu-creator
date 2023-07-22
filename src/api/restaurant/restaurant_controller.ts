import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

import { deleteImage, uploadImage } from "../../core/storage/azure_storage";
import StorageEnum from "../../core/constants/storage/storage_enum";
import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";

// Entities
import ProductModel from "../product/product_model";
import RestaurantModel from "./restaurant_model";
import RestaurantCredential from "../authentication/restaurant_credential_model";
import CategoryModel from "../category/category_model";
import MenuModel from "../menu/menu_model";
import PlanModel from "../plan/plan_model";
import PurchasePlan from "../purchase/purchase_model";
// Exceptions
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";
import NotFoundException from "../../core/exceptions/not_found_exception";
import BadRequestException from "../../core/exceptions/bad_request_exception";

import { comparePassword } from "../../features/utils/hash_password";

async function getRestaurantInformation(req: Request, res: Response) {
  try {
    const { restaurantId } = req.body;
    const restaurant = await RestaurantModel.findOne(
      {
        _id: restaurantId,
      },
      { role: 0, __v: 0 }
    );

    if (!restaurant) throw new UnauthorizedException("Invalid restaurant id");

    let restaurantDto = {};

    const restaurantCredential = await RestaurantCredential.findOne({
      _id: restaurantId,
    });

    if (restaurant.profileImage != null && restaurant.profileImage != "") {
      restaurant.profileImage = getFileNameWithUrl(
        StorageEnum.RESTAURANT_PROFILE_IMAGE,
        restaurant.profileImage
      );
    } else {
      restaurant.profileImage = null;
    }

    let purchase = null;
    if (restaurant.currentPlanId != null && restaurant.currentPlanId != "") {
      purchase = await PurchasePlan.findOne(
        {
          restaurantId,
          isActive: true,
        },
        { _id: 0, __v: 0, paymentMethod: 0, paymentStatus: 0, restaurantId: 0 }
      );
    }
    restaurantDto = {
      ...restaurant.toObject(),
      email: restaurantCredential?.email,
      phone: restaurantCredential?.phone,
      purchase,
    };

    res.status(200).json(BaseResponse.success(restaurantDto));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function addOrUpdateSocialMedia(req: Request, res: Response) {
  try {
    const {
      restaurantId,
      facebook,
      twitter,
      instagram,
      website,
      threads,
      whatsapp,
    } = req.body;

    const restaurant = await RestaurantModel.findById(restaurantId, {
      socialMedias: 1,
    });

    if (!restaurant) throw new NotFoundException("Restaurant not found");

    restaurant.socialMedias = {
      facebook: facebook ?? "",
      twitter: twitter ?? "",
      instagram: instagram ?? "",
      website: website ?? "",
      threads: threads ?? "",
      whatsapp: whatsapp ?? "",
    };

    restaurant.save();

    res
      .status(200)
      .json(
        BaseResponse.success(restaurant.socialMedias, ResponseStatus.SUCCESS)
      );
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function deleteRestaurant(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { restaurantId, password } = req.body;
    if (!password) throw new BadRequestException("Password is required");
    if (!restaurantId)
      throw new BadRequestException("Restaurant id is required");

    const credential = await RestaurantCredential.findOne({
      _id: restaurantId,
      isActive: true,
    });

    if (!credential) throw new NotFoundException("Restaurant not found");

    if (!(await comparePassword(password, credential.hashedPassword))) {
      throw new UnauthorizedException("Password is incorrect");
    }

    await RestaurantCredential.findOneAndUpdate(
      {
        _id: restaurantId,
        isActive: true,
      },
      { $set: { isActive: false } },
      { session }
    );

    const updateResult = await RestaurantModel.findOneAndUpdate(
      {
        _id: restaurantId,
        isActive: true,
      },
      { $set: { isActive: false } },
      { session }
    );

    if (!updateResult) throw new NotFoundException("Restaurant not found");

    const products = await ProductModel.find({
      restaurantId: restaurantId,
      isActive: true,
    });

    const productIds = products.map((product) => product._id);

    await ProductModel.updateMany(
      { _id: { $in: productIds } },
      { $set: { isActive: false } },
      { session }
    );

    // Delete images code here...

    const categories = await CategoryModel.find({
      restaurantId: restaurantId,
      isActive: true,
    });

    const categoryIds = categories.map((category) => category._id);

    await CategoryModel.updateMany(
      { _id: { $in: categoryIds } },
      { $set: { isActive: false } },
      { session }
    );

    // Delete category images code here...

    const menus = await MenuModel.find({
      restaurantId: restaurantId,
      isActive: true,
    });

    const menuIds = menus.map((menu) => menu._id);

    await MenuModel.updateMany(
      { _id: { $in: menuIds } },
      { $set: { isActive: false } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.status(200).json(BaseResponse.success(null, ResponseStatus.SUCCESS));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function changeResstaurantImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .send(
          BaseResponse.fail("File is required", ResponseStatus.BAD_REQUEST)
        );
    }
    const { restaurantId } = req.body;

    const restaurant = await RestaurantModel.findOne({
      _id: restaurantId,
    });

    if (restaurant.profileImage) {
      // resim silinecek
      await deleteImage(
        StorageEnum.RESTAURANT_PROFILE_IMAGE,
        restaurant.profileImage
      );
    }
    const fileName = uploadFileRename(req.file.originalname);
    await uploadImage(StorageEnum.RESTAURANT_PROFILE_IMAGE, fileName, req.file);
    const fileUrl = `${process.env.AZURE_STORAGE_URL}/${StorageEnum.RESTAURANT_PROFILE_IMAGE}/${fileName}`;

    await RestaurantModel.updateOne(
      {
        _id: restaurantId,
      },
      {
        profileImage: fileName,
      }
    );
    res.status(200).json(BaseResponse.success(fileUrl));
  } catch (error) {
    console.log(error);
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function updateRestaurantInformation(req: Request, res: Response) {
  try {
    const {
      restaurantId,
      name,
      email,
      countryCode,
      phoneNumber,
      latitude,
      longitude,
      currency,
    } = req.body;

    const restaurantCredential = await RestaurantCredential.findOne({
      _id: restaurantId,
      isActive: true,
    });

    if (!restaurantCredential)
      throw new UnauthorizedException("Invalid restaurant id");

    const updateCredentialData = {
      email:
        email !== undefined && email !== ""
          ? email
          : restaurantCredential.email,
      phone: {
        countryCode:
          countryCode !== undefined && countryCode !== ""
            ? countryCode
            : restaurantCredential.phone.countryCode,
        phoneNumber:
          phoneNumber !== undefined && phoneNumber !== ""
            ? phoneNumber
            : restaurantCredential.phone.phoneNumber,
      },
    };

    await RestaurantCredential.findOneAndUpdate(
      {
        _id: restaurantId,
        isActive: true,
      },
      updateCredentialData
    );

    const restaurant = await RestaurantModel.findOne(
      {
        _id: restaurantId,
        isActive: true,
      },
      { __v: 0 }
    );

    let fileName = "";
    if (req.file) {
      if (restaurant.profileImage) {
        // resim silinecek
        await deleteImage(
          StorageEnum.RESTAURANT_PROFILE_IMAGE,
          restaurant.profileImage
        );
      }
      fileName = uploadFileRename(req.file.originalname);
      await uploadImage(
        StorageEnum.RESTAURANT_PROFILE_IMAGE,
        fileName,
        req.file
      );
    }
    const restaurantUpdateData = {
      name: name !== undefined && name !== "" ? name : restaurant.name,
      location: {
        latitude:
          latitude !== undefined && latitude !== ""
            ? latitude
            : restaurant.location.latitude,
        longitude:
          longitude !== undefined && longitude !== ""
            ? longitude
            : restaurant.location.longitude,
      },
      defaultCurrency:
        currency !== undefined && currency !== ""
          ? currency
          : restaurant.defaultCurrency,
      profileImage: fileName !== "" ? fileName : restaurant.profileImage,
    };

    await RestaurantModel.findOneAndUpdate(
      {
        _id: restaurantId,
        isActive: true,
      },
      restaurantUpdateData
    );

    const restaurantDto = {
      ...restaurant.toObject(),
      email: restaurantCredential?.email,
      phone: restaurantCredential?.phone,
    };

    res
      .status(200)
      .json(BaseResponse.success(restaurantDto, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

export {
  getRestaurantInformation,
  addOrUpdateSocialMedia,
  deleteRestaurant,
  updateRestaurantInformation,
  changeResstaurantImage,
};
