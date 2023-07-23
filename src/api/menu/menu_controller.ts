import { Request, Response } from "express";
import MenuModel from "./menu_model";
import CategoryModel from "../category/models/category_model";
import ProductModel from "../product/product_model";
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import MenuValidator from "../../features/validators/menu_validator";
import BadRequestException from "../../core/exceptions/bad_request_exception";
import NotFoundException from "../../core/exceptions/not_found_exception";
import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";
import { uploadImage } from "../../core/storage/azure_storage";
import StorageEnum from "../../core/constants/storage/storage_enum";

async function getMenuBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const menu = await MenuModel.findOne(
      { slug, isActive: true },
      {
        name: 1,
        templateId: 1,
        restaurantId: 1,
        coverImage: 1,
      }
    );

    if (!menu) throw new NotFoundException("Menu not found");

    menu.coverImage =
      menu.coverImage != null
        ? getFileNameWithUrl(StorageEnum.MENU_COVER_IMAGES, menu.coverImage)
        : null;

    const categories = await CategoryModel.find(
      { menuId: menu._id, isActive: true },
      {
        name: 1,
        menuId: 1,
        image: 1,
        position: 1,
        description: 1,
      }
    );

    if (categories.length > 0) {
      categories.forEach((category) => {
        category.image =
          category.image != null
            ? getFileNameWithUrl(StorageEnum.CATEGORY_IMAGES, category.image)
            : null;
      });
    }

    const products = await ProductModel.find(
      { menuId: menu._id, isActive: true },
      {
        name: 1,
        categoryId: 1,
        menuId: 1,
        images: 1,
        price: 1,
        description: 1,
      }
    );

    if (products.length > 0) {
      products.forEach((product) => {
        product.images != null
          ? product.images.forEach((image, index) => {
              product.images[index] = getFileNameWithUrl(
                StorageEnum.PRODUCT_IMAGES,
                image
              );
            })
          : null;
      });
    }

    const dto = {
      menu,
      categories,
      products,
    };
    res.status(200).json(BaseResponse.success(dto, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

async function getAll(req: Request, res: Response) {
  try {
    const { restaurantId } = req.body;
    let { isActive } = req.query;

    if (!isActive) isActive = "true";
    console.log(isActive);
    const menus = await MenuModel.find(
      { restaurantId, isActive: isActive },
      {
        name: 1,
        templateId: 1,
        restaurantId: 1,
        coverImage: 1,
        isPublished: 1,
      }
    );
    const menuIds = menus.map((menu) => menu._id);

    const productCounts = await Promise.all(
      menuIds.map(async (menuId) => {
        const count = await ProductModel.countDocuments({
          menuId,
          isActive: isActive,
        });
        return { menuId, count };
      })
    );
    const categoryCounts = await Promise.all(
      menuIds.map(async (menuId) => {
        const count = await CategoryModel.countDocuments({
          menuId,
          isActive: isActive,
        });
        return { menuId, count };
      })
    );

    let dtos: Object[] = [];
    menus.forEach((menu) => {
      const productCount = productCounts.find(
        (productCount) => productCount.menuId === menu._id
      );
      const categoryCount = categoryCounts.find(
        (categoryCount) => categoryCount.menuId === menu._id
      );
      dtos.push({
        _id: menu._id,
        name: menu.name,
        templateId: menu.templateId,
        restaurantId: menu.restaurantId,
        productCount: productCount?.count,
        categoryCount: categoryCount.count,
        isPublished: menu.isPublished,
        coverImage:
          menu.coverImage != null
            ? getFileNameWithUrl(StorageEnum.MENU_COVER_IMAGES, menu.coverImage)
            : null,
      });
    });

    res.status(200).json(BaseResponse.success(dtos, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}

async function createMenu(req: Request, res: Response) {
  const { restaurantId, templateId, name } = req.body;

  let imageName = undefined;
  let imageUrl = undefined;
  if (req.file) {
    imageName = uploadFileRename(req.file.originalname);
    await uploadImage(StorageEnum.MENU_COVER_IMAGES, imageName, req.file);
    imageUrl = getFileNameWithUrl(StorageEnum.MENU_COVER_IMAGES, imageName);
  }
  try {
    // create menu but check slug is unique
    let tempSlug = name.toLowerCase().replace(/ /g, "-");
    let slug = tempSlug;
    let isSlugUnique = false;
    let i = 0;
    while (!isSlugUnique) {
      await MenuModel.findOne({ slug }).then((menu) => {
        if (!menu) isSlugUnique = true;
        else {
          i++;
          slug = tempSlug + "-" + i;
        }
      });
    }
    const maxPositionMenu = await MenuModel.findOne({ restaurantId }).sort({
      position: -1,
    });
    const menu = await MenuModel.create({
      restaurantId,
      templateId,
      name,
      slug,
      coverImage: imageName,
      position: maxPositionMenu ? maxPositionMenu.position + 1 : 0,
    });

    await MenuValidator.validate({
      restaurantId,
      templateId,
    }).catch((err) => {
      throw new BadRequestException(err);
    });

    const dto = {
      _id: menu._id,
      name: menu.name,
      templateId: menu.templateId,
      restaurantId: menu.restaurantId,
      coverImage: imageUrl,
      slug: menu.slug,
      position: menu.position,
    };
    res.status(200).json(BaseResponse.success(dto, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail("asdasdas", ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}

async function deleteMenu(req: Request, res: Response) {
  try {
    const { restaurantId, menuId } = req.body;

    const menu = await MenuModel.findOne({ _id: menuId, restaurantId });

    if (!menu) throw new NotFoundException("Menu not found");

    menu.isActive = false;
    await menu.save();

    await CategoryModel.updateMany({ menuId }, { isActive: false });
    await ProductModel.updateMany({ menuId }, { isActive: false });

    res.status(200).json(BaseResponse.success(null, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function relocateMenu(req: Request, res: Response) {
  try {
    const { restaurantId, menuId, newPosition } = req.body;

    const menu = await MenuModel.findOne({
      _id: menuId,
    });

    const menus = await MenuModel.find({
      restaurantId,
      position: {
        $gte: newPosition,
        $lt: menu.position,
      },
    });

    await MenuModel.updateOne(
      {
        _id: menuId,
      },
      {
        position: newPosition,
      }
    );

    menus.forEach(async (menu) => {
      await MenuModel.updateOne(
        {
          _id: menu._id,
        },
        {
          position: menu.position + 1,
        }
      );
    });

    res.status(200).json(BaseResponse.success(menus, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}
async function publishMenu(req: Request, res: Response) {
  try {
    const { restaurantId } = req.body;
    const { menuId } = req.params;

    const menu = await MenuModel.findOne({
      _id: menuId,
      restaurantId,
      isActive: true,
    });

    if (!menu) throw new NotFoundException("Menu not found");

    menu.isPublished = menu.isPublished ? false : true;

    await menu.save();

    res
      .status(200)
      .json(BaseResponse.success(menu.isPublished, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}
export {
  getMenuBySlug,
  getAll,
  createMenu,
  deleteMenu,
  relocateMenu,
  publishMenu,
};
