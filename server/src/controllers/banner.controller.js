import Banner from '../models/banner.model.js';
import { HTTP_STATUS } from '../config/constants.js';

// Get all active banners sorted by order
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1 });

    if (!banners || banners.length === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        count: 0,
        data: [],
        message: 'No banners found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message,
    });
  }
};

// Get single banner by ID
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching banner',
      error: error.message,
    });
  }
};

// Create new banner (Admin)
const createBanner = async (req, res) => {
  try {
    const { title, description, image, link, buttonText, order } = req.body;

    const banner = new Banner({
      title,
      description,
      image,
      link,
      buttonText,
      order,
    });

    await banner.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Error creating banner',
      error: error.message,
    });
  }
};

// Update banner (Admin)
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, link, buttonText, order, active } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      {
        title,
        description,
        image,
        link,
        buttonText,
        order,
        active,
      },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Error updating banner',
      error: error.message,
    });
  }
};

// Delete banner (Admin)
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message,
    });
  }
};

export default {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
