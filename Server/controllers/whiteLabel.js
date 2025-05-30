// import { whitelabel } from "../models/WhiteLabel.js";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import PDFDocument from "pdfkit";

// const uploadDir = "uploads/";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPEG, JPG, PNG, and GIF images are allowed"), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 100 * 1024 * 1024 },
// });

// export const createWhitelabel = async (req, res) => {
//   try {
//     const { whitelabel_user, user, hexacode, url } = req.body;

//     if (!whitelabel_user || !user || !hexacode || !url) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "Logo image is required" });
//     }

//     const logo = req.file.path;

//     const newWhitelabel = new whitelabel({
//       whitelabel_user,
//       user,
//       logo,
//       hexacode,
//       url,
//     });

//     const savedWhitelabel = await newWhitelabel.save();
//     res.status(201).json({
//       message: "Whitelabel created successfully",
//       data: savedWhitelabel,
//     });
//   } catch (error) {
//     if (error.code === 11000 && error.keyPattern && error.keyPattern.user) {
//       return res.status(400).json({
//         message: "User name already taken, please try a different user name",
//       });
//     }
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getAllWhitelabels = async (req, res) => {
//   try {
//     const whitelabels = await whitelabel.find();
//     res.status(200).json({
//       message: "Whitelabels retrieved successfully",
//       data: whitelabels,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getWhitelabelById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const foundWhitelabel = await whitelabel.findById(id);

//     if (!foundWhitelabel) {
//       return res.status(404).json({ message: "Whitelabel not found" });
//     }

//     res.status(200).json({
//       message: "Whitelabel retrieved successfully",
//       data: foundWhitelabel,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const updateWhitelabel = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { whitelabel_user, user, hexacode, url } = req.body;
//     const updateData = { whitelabel_user, user, hexacode, url };

//     if (req.file) {
//       updateData.logo = req.file.path;
//     }

//     const updatedWhitelabel = await whitelabel.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedWhitelabel) {
//       return res.status(404).json({ message: "Whitelabel not found" });
//     }

//     res.status(200).json({
//       message: "Whitelabel updated successfully",
//       data: updatedWhitelabel,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const deleteWhitelabel = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedWhitelabel = await whitelabel.findByIdAndDelete(id);

//     if (!deletedWhitelabel) {
//       return res.status(404).json({ message: "Whitelabel not found" });
//     }

//     res.status(200).json({
//       message: "Whitelabel deleted successfully",
//       data: deletedWhitelabel,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const uploadMiddleware = upload.single("logo");

import { whitelabel } from "../models/WhiteLabel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, PNG, and GIF images are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const createWhitelabel = async (req, res) => {
  try {
    const { whitelabel_user, group, hexacode, url } = req.body;

    if (!whitelabel_user || !group || !hexacode || !url) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Logo image is required" });
    }

    const logo = req.file.path;

    const newWhitelabel = new whitelabel({
      whitelabel_user,
      group,
      logo,
      hexacode,
      url,
    });

    const savedWhitelabel = await newWhitelabel.save();
    res.status(201).json({
      message: "Whitelabel created successfully",
      data: savedWhitelabel,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.group) {
      return res.status(400).json({
        message: "Group name already taken, please try a different group name",
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllWhitelabels = async (req, res) => {
  try {
    const whitelabels = await whitelabel.find();
    res.status(200).json({
      message: "Whitelabels retrieved successfully",
      data: whitelabels,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getWhitelabelById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundWhitelabel = await whitelabel.findById(id);

    if (!foundWhitelabel) {
      return res.status(404).json({ message: "Whitelabel not found" });
    }

    res.status(200).json({
      message: "Whitelabel retrieved successfully",
      data: foundWhitelabel,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateWhitelabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { whitelabel_user, group, hexacode, url } = req.body;
    const updateData = { whitelabel_user, group, hexacode, url };

    if (req.file) {
      updateData.logo = req.file.path;
    }

    const updatedWhitelabel = await whitelabel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedWhitelabel) {
      return res.status(404).json({ message: "Whitelabel not found" });
    }

    res.status(200).json({
      message: "Whitelabel updated successfully",
      data: updatedWhitelabel,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteWhitelabel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWhitelabel = await whitelabel.findByIdAndDelete(id);

    if (!deletedWhitelabel) {
      return res.status(404).json({ message: "Whitelabel not found" });
    }

    res.status(200).json({
      message: "Whitelabel deleted successfully",
      data: deletedWhitelabel,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const uploadMiddleware = upload.single("logo");