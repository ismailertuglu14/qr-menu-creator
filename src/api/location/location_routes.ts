import axios from "axios";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import BaseResponse from "../../core/response/base_response";
import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import RestaurantModel from "../restaurant/restaurant_model";
import NotFoundException from "../../core/exceptions/not_found_exception";
const router = Router();
/**
 * Example of a route with query params
 * https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=51.4694&longitude=-0.9732&localityLanguage=en
 */
router.get(
  "/",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { restaurantId } = req.body;
      const { lang } = req.query;
      const restaurant = await RestaurantModel.findOne({
        _id: restaurantId,
        isActive: true,
      });
      console.log(restaurant.location.latitude, restaurant.location.longitude);
      if (!restaurant) throw new NotFoundException("Restaurant not found");
      const requestURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${restaurant.location.latitude}&longitude=${restaurant.location.latitude}&localityLanguage=${lang}`;
      const response = await axios.get(requestURL);
      return res.status(200).json(
        BaseResponse.success(
          {
            locality: response.data.locality,
            city: response.data.city,
            country: response.data.countryName,
          },
          ResponseStatus.SUCCESS
        )
      );
    } catch (error) {
      res
        .status(500)
        .json(
          BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
        );
    }
  }
);
export default router;
