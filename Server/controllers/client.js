// import Client from '../models/Client.js';
// import { whitelabel } from '../models/WhiteLabel.js';
// import ProofType from '../models/Proof.js';
// import Sport from '../models/Sports.js';
// import Market from '../models/Market.js';
// import puppeteer from 'puppeteer';

// export const generatePreviewPDF = async (req, res) => {
//   try {
//     const { html } = req.body;

//     if (!html) {
//       return res.status(400).json({ error: 'HTML content is required' });
//     }

//     console.log('Received HTML for PDF generation:', html.substring(0, 500) + '...');

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });
//     const page = await browser.newPage();

//     page.on('requestfailed', (request) => {
//       console.warn(`Failed to load resource: ${request.url()}`);
//     });

//     await page.setViewport({
//       width: 540,
//       height: 1,
//       deviceScaleFactor: 1,
//     });

//     console.log('Setting HTML content...');
//     await page.setContent(html, {
//       waitUntil: 'networkidle0',
//       timeout: 60000,
//     });

//     await page.evaluate(() => {
//       const images = Array.from(document.querySelectorAll('img'));
//       return Promise.all(
//         images.map((img) =>
//           img.complete
//             ? Promise.resolve()
//             : new Promise((resolve) => {
//                 img.onload = resolve;
//                 img.onerror = resolve;
//               })
//         )
//       );
//     });

//     console.log('Calculating content height...');
//     const contentHeight = await page.evaluate(() => {
//       const container = document.querySelector('.preview-container');
//       return container ? container.offsetHeight : 800;
//     });

//     console.log(`Content height: ${contentHeight}px`);

//     const pdfBuffer = await page.pdf({
//       width: '540px',
//       height: `${contentHeight + 50}px`,
//       printBackground: true,
//       margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
//     });

//     console.log('PDF generated successfully');

//     await browser.close();

//     res.setHeader('Content-Disposition', 'attachment; filename="client-preview.pdf"');
//     res.setHeader('Content-Type', 'application/pdf');

//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
//   }
// };

// export const createClient = async (req, res) => {
//   try {
//     const { agentname, username, user, amount, prooftype, sportname, marketname, eventname, navigation, profitAndLoss } = req.body;

//     // Validate required fields
//     if (!user || !eventname || !navigation) {
//       return res.status(400).json({
//         message: 'Missing required fields',
//         details: {
//           user: !user ? 'User is required' : undefined,
//           eventname: !eventname ? 'Event name is required' : undefined,
//           navigation: !navigation ? 'Navigation is required' : undefined,
//         },
//       });
//     }

//     // Find corresponding IDs for names
//     const whitelabelInstance = await whitelabel.findOne({ whitelabel_user: username });
//     const proof = await ProofType.findOne({ type: prooftype });
//     const sport = await Sport.findOne({ sportsName: sportname });
//     const market = await Market.findOne({ marketName: marketname });

//     if (!whitelabelInstance || !proof || !sport || !market) {
//       return res.status(400).json({
//         message: 'Invalid data provided',
//         details: {
//           whitelabel: !whitelabelInstance ? 'Username not found' : undefined,
//           proof: !proof ? 'Proof type not found' : undefined,
//           sport: !sport ? 'Sport not found' : undefined,
//           market: !market ? 'Market not found' : undefined,
//         },
//       });
//     }

//     const client = new Client({
//       agentname,
//       username: whitelabelInstance._id,
//       user,
//       amount,
//       prooftype: proof._id,
//       sportname: sport._id,
//       marketname: market._id,
//       eventname,
//       navigation,
//       profitAndLoss,
//     });

//     await client.save();

//     // Populate the response
//     const populatedClient = await Client.findById(client._id)
//       .populate('username', 'whitelabel_user')
//       .populate('prooftype', 'type content')
//       .populate('sportname', 'sportsName')
//       .populate('marketname', 'marketName');

//     res.status(201).json(populatedClient);
//   } catch (error) {
//     console.error('Create client error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export const getAllClients = async (req, res) => {
//   try {
//     const clients = await Client.find()
//       .populate('username', 'whitelabel_user user logo hexacode url')
//       .populate('prooftype', 'type content')
//       .populate('sportname', 'sportsName')
//       .populate('marketname', 'marketName');
//     res.status(200).json(clients);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getClientById = async (req, res) => {
//   try {
//     const client = await Client.findById(req.params.id)
//       .populate('username', 'whitelabel_user user logo hexacode url')
//       .populate('prooftype', 'type content')
//       .populate('sportname', 'sportsName')
//       .populate('marketname', 'marketName');
//     if (!client) return res.status(404).json({ message: 'Client not found' });
//     res.status(200).json(client);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateClient = async (req, res) => {
//   try {
//     const { agentname, username, user, amount, prooftype, sportname, marketname, eventname, navigation, profitAndLoss } = req.body;

//     let whitelabelId, proofId, sportId, marketId;
//     if (username) {
//       const whitelabelInstance = await whitelabel.findOne({ whitelabel_user: username });
//       if (!whitelabelInstance) return res.status(400).json({ message: 'Invalid username: User not found' });
//       whitelabelId = whitelabelInstance._id;
//     }
//     if (prooftype) {
//       const proof = await ProofType.findOne({ type: prooftype });
//       if (!proof) return res.status(400).json({ message: 'Invalid proof type: Proof not found' });
//       proofId = proof._id;
//     }
//     if (sportname) {
//       const sport = await Sport.findOne({ sportsName: sportname });
//       if (!sport) return res.status(400).json({ message: 'Invalid sport name: Sport not found' });
//       sportId = sport._id;
//     }
//     if (marketname) {
//       const market = await Market.findOne({ marketName: marketname });
//       if (!market) return res.status(400).json({ message: 'Invalid market name: Market not found' });
//       marketId = market._id;
//     }

//     const updatedClient = await Client.findByIdAndUpdate(
//       req.params.id,
//       {
//         agentname,
//         username: whitelabelId || undefined,
//         user,
//         amount,
//         prooftype: proofId || undefined,
//         sportname: sportId || undefined,
//         marketname: marketId || undefined,
//         eventname,
//         navigation,
//         profitAndLoss,
//       },
//       { new: true, runValidators: true }
//     )
//       .populate('username', 'whitelabel_user user logo hexacode url')
//       .populate('prooftype', 'type content')
//       .populate('sportname', 'sportsName')
//       .populate('marketname', 'marketName');

//     if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
//     res.status(200).json(updatedClient);
//   } catch (error) {
//     console.error('Update client error:', error);
//     res.status(400).json({ message: error.message });
//   }
// };

// export const deleteClient = async (req, res) => {
//   try {
//     const client = await Client.findByIdAndDelete(req.params.id);
//     if (!client) return res.status(404).json({ message: 'Client not found' });
//     res.status(200).json({ message: 'Client deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getAllWhitelabels = async (req, res) => {
//   try {
//     const whitelabels = await whitelabel.find();
//     res.status(200).json({
//       message: 'Whitelabels retrieved successfully',
//       data: whitelabels,
//     });
//   } catch (error) {
//     console.error('Get whitelabels error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export const getProofTypes = async (req, res) => {
//   try {
//     const proofs = await ProofType.find().select('type content _id');
//     res.status(200).json(proofs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getSports = async (req, res) => {
//   try {
//     const sports = await Sport.find().select('sportsName _id');
//     res.status(200).json(sports);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getMarkets = async (req, res) => {
//   try {
//     const markets = await Market.find().select('marketName _id');
//     res.status(200).json(markets);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



import Client from '../models/Client.js';
import { whitelabel } from '../models/WhiteLabel.js';
import ProofType from '../models/Proof.js';
import Sport from '../models/Sports.js';
import Market from '../models/Market.js';
import puppeteer from 'puppeteer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
}).array('images', 5); // Allow up to 5 images

export const generatePreviewPDF = async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('Received HTML for PDF generation:', html.substring(0, 500) + '...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    page.on('requestfailed', (request) => {
      console.warn(`Failed to load resource: ${request.url()}`);
    });

    await page.setViewport({
      width: 540,
      height: 1,
      deviceScaleFactor: 1,
    });

    console.log('Setting HTML content...');
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              })
        )
      );
    });

    console.log('Calculating content height...');
    const contentHeight = await page.evaluate(() => {
      const container = document.querySelector('.preview-container');
      return container ? container.offsetHeight : 800;
    });

    console.log(`Content height: ${contentHeight}px`);

    const pdfBuffer = await page.pdf({
      width: '540px',
      height: `${contentHeight + 50}px`,
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    console.log('PDF generated successfully');

    await browser.close();

    res.setHeader('Content-Disposition', 'attachment; filename="client-preview.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
};

export const createClient = async (req, res) => {
  // Wrap the handler in multer middleware
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Image upload error', error: err.message });
      } else if (err) {
        return res.status(400).json({ message: 'Invalid image format', error: err.message });
      }

      const {
        agentname,
        username,
        user,
        amount,
        prooftype,
        sportname,
        marketname,
        eventname,
        navigation,
        profitAndLoss,
      } = req.body;

      // Validate required fields
      if (!user || !eventname || !navigation) {
        return res.status(400).json({
          message: 'Missing required fields',
          details: {
            user: !user ? 'User is required' : undefined,
            eventname: !eventname ? 'Event name is required' : undefined,
            navigation: !navigation ? 'Navigation is required' : undefined,
          },
        });
      }

      // Find corresponding IDs for names
      const whitelabelInstance = await whitelabel.findOne({ whitelabel_user: username });
      const proof = await ProofType.findOne({ type: prooftype });
      const sport = await Sport.findOne({ sportsName: sportname });
      const market = await Market.findOne({ marketName: marketname });

      if (!whitelabelInstance || !proof || !sport || !market) {
        return res.status(400).json({
          message: 'Invalid data provided',
          details: {
            whitelabel: !whitelabelInstance ? 'Username not found' : undefined,
            proof: !proof ? 'Proof type not found' : undefined,
            sport: !sport ? 'Sport not found' : undefined,
            market: !market ? 'Market not found' : undefined,
          },
        });
      }

      // Process uploaded images
      const images = req.files
        ? req.files.map((file) => ({
            path: file.path,
            filename: file.filename,
          }))
        : [];

      const client = new Client({
        agentname,
        username: whitelabelInstance._id,
        user,
        amount,
        prooftype: proof._id,
        sportname: sport._id,
        marketname: market._id,
        eventname,
        navigation,
        profitAndLoss,
        images,
      });

      await client.save();

      // Populate the response
      const populatedClient = await Client.findById(client._id)
        .populate('username', 'whitelabel_user')
        .populate('prooftype', 'type content')
        .populate('sportname', 'sportsName')
        .populate('marketname', 'marketName');

      res.status(201).json(populatedClient);
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate('username', 'whitelabel_user user logo hexacode url')
      .populate('prooftype', 'type content')
      .populate('sportname', 'sportsName')
      .populate('marketname', 'marketName');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('username', 'whitelabel_user user logo hexacode url')
      .populate('prooftype', 'type content')
      .populate('sportname', 'sportsName')
      .populate('marketname', 'marketName');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  // Wrap the handler in multer middleware
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Image upload error', error: err.message });
      } else if (err) {
        return res.status(400).json({ message: 'Invalid image format', error: err.message });
      }

      const {
        agentname,
        username,
        user,
        amount,
        prooftype,
        sportname,
        marketname,
        eventname,
        navigation,
        profitAndLoss,
      } = req.body;

      let whitelabelId, proofId, sportId, marketId;
      if (username) {
        const whitelabelInstance = await whitelabel.findOne({ whitelabel_user: username });
        if (!whitelabelInstance) return res.status(400).json({ message: 'Invalid username: User not found' });
        whitelabelId = whitelabelInstance._id;
      }
      if (prooftype) {
        const proof = await ProofType.findOne({ type: prooftype });
        if (!proof) return res.status(400).json({ message: 'Invalid proof type: Proof not found' });
        proofId = proof._id;
      }
      if (sportname) {
        const sport = await Sport.findOne({ sportsName: sportname });
        if (!sport) return res.status(400).json({ message: 'Invalid sport name: Sport not found' });
        sportId = sport._id;
      }
      if (marketname) {
        const market = await Market.findOne({ marketName: marketname });
        if (!market) return res.status(400).json({ message: 'Invalid market name: Market not found' });
        marketId = market._id;
      }

      // Process uploaded images
      const images = req.files
        ? req.files.map((file) => ({
            path: file.path,
            filename: file.filename,
          }))
        : undefined; // Keep existing images if no new ones are uploaded

      const updatedClient = await Client.findByIdAndUpdate(
        req.params.id,
        {
          agentname,
          username: whitelabelId || undefined,
          user,
          amount,
          prooftype: proofId || undefined,
          sportname: sportId || undefined,
          marketname: marketId || undefined,
          eventname,
          navigation,
          profitAndLoss,
          images: images || undefined, // Only update images if new ones are provided
        },
        { new: true, runValidators: true }
      )
        .populate('username', 'whitelabel_user user logo hexacode url')
        .populate('prooftype', 'type content')
        .populate('sportname', 'sportsName')
        .populate('marketname', 'marketName');

      if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
      res.status(200).json(updatedClient);
    } catch (error) {
      console.error('Update client error:', error);
      res.status(400).json({ message: error.message });
    }
  });
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Delete associated images from the server
    if (client.images && client.images.length > 0) {
      client.images.forEach((image) => {
        const filePath = path.resolve(image.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllWhitelabels = async (req, res) => {
  try {
    const whitelabels = await whitelabel.find();
    res.status(200).json({
      message: 'Whitelabels retrieved successfully',
      data: whitelabels,
    });
  } catch (error) {
    console.error('Get whitelabels error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProofTypes = async (req, res) => {
  try {
    const proofs = await ProofType.find().select('type content _id');
    res.status(200).json(proofs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSports = async (req, res) => {
  try {
    const sports = await Sport.find().select('sportsName _id');
    res.status(200).json(sports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarkets = async (req, res) => {
  try {
    const markets = await Market.find().select('marketName _id');
    res.status(200).json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};