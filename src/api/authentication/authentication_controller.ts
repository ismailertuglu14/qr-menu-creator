import { ResponseStatus } from "../../core/constants/response_status_enum";
import StorageEnum from "../../core/constants/storage/storage_enum";
import BaseResponse from "../../core/response/base_response";
import {
  deleteImage,
  deleteMultipleImage,
  uploadImage,
  uploadMultipleImage,
} from "../../core/storage/azure_storage";
import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";

import { Request, Response, NextFunction } from "express";

// Entities
import ProductModel from "../product/product_model";
import RestaurantModel from "../restaurant/restaurant_model";
import RestaurantCredential from "./restaurant_credential_model";
import CategoryModel from "../category/category_model";
import MenuModel from "../menu/menu_model";
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";
import NotFoundException from "../../core/exceptions/not_found_exception";
import mongoose from "mongoose";
import BadRequestException from "../../core/exceptions/bad_request_exception";
import { comparePassword } from "../../features/utils/hash_password";
