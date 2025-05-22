import Client from '../models/Client.js';
import { whitelabel } from '../models/WhiteLabel.js';
import ProofType from '../models/Proof.js';
import Sport from '../models/Sports.js';
import Market from '../models/Market.js';
import puppeteer from 'puppeteer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
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
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
}).array('images', 6);

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
      width: 595,
      height: 842,
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

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
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
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Image upload error', error: err.message });
      } else if (err) {
        return res.status(400).json({ message: 'Invalid image format', error: err.message });
      }

      const {
        agentname,
        whitelabel_user,
        user,
        amount,
        prooftype,
        sportname,
        marketname,
        eventname,
        navigation,
        profitAndLoss,
        navigation2, 
        navigation2Images, 
      } = req.body;

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

      const whitelabelInstance = await whitelabel.findOne({ whitelabel_user: whitelabel_user });
      const proof = await ProofType.findOne({ type: prooftype });
      const sport = await Sport.findOne({ sportsName: sportname });
      const market = await Market.findOne({ marketName: marketname });

      if (!whitelabelInstance || !proof || !sport || !market) {
        return res.status(400).json({
          message: 'Invalid data provided',
          details: {
            whitelabel: !whitelabelInstance ? 'whitelabel_user not found' : undefined,
            proof: !proof ? 'Proof type not found' : undefined,
            sport: !sport ? 'Sport not found' : undefined,
            market: !market ? 'Market not found' : undefined,
          },
        });
      }

      const images = req.files
        ? req.files.map((file) => ({
            path: file.path,
            filename: file.filename,
          }))
        : [];

      let navigation2ImagesData = [];
      if (navigation2Images && Array.isArray(navigation2Images)) {
        navigation2ImagesData = navigation2Images.map((image) => ({
          path: image.path,
          filename: image.filename,
        }));
      }

      const client = new Client({
        agentname,
        whitelabel_user: whitelabelInstance._id,
        user,
        amount,
        prooftype: proof._id,
        sportname: sport._id,
        marketname: market._id,
        eventname,
        navigation,
        profitAndLoss,
        images,
        navigation2: navigation2 || undefined, // Set to undefined if not provided
        navigation2Images: navigation2ImagesData.length > 0 ? navigation2ImagesData : undefined, // Set to undefined if empty
      });

      await client.save();

      const populatedClient = await Client.findById(client._id)
        .populate('whitelabel_user', 'whitelabel_user')
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
      .populate('whitelabel_user', 'whitelabel_user user logo hexacode url')
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
      .populate('whitelabel_user', 'whitelabel_user user logo hexacode url')
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
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Image upload error', error: err.message });
      } else if (err) {
        return res.status(400).json({ message: 'Invalid image format', error: err.message });
      }

      const {
        agentname,
        whitelabel_user,
        user,
        amount,
        prooftype,
        sportname,
        marketname,
        eventname,
        navigation,
        profitAndLoss,
        navigation2,
        navigation2Images,
      } = req.body;

      let whitelabelId, proofId, sportId, marketId;
      if (whitelabel_user) {
        const whitelabelInstance = await whitelabel.findOne({ whitelabel_user: whitelabel_user });
        if (!whitelabelInstance) return res.status(400).json({ message: 'Invalid whitelabel_user: User not found' });
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

      const images = req.files
        ? req.files.map((file) => ({
            path: file.path,
            filename: file.filename,
          }))
        : undefined;

      let navigation2ImagesData = undefined;
      if (navigation2Images && Array.isArray(navigation2Images)) {
        navigation2ImagesData = navigation2Images.map((image) => ({
          path: image.path,
          filename: image.filename,
        }));
      }

      const updatedClient = await Client.findByIdAndUpdate(
        req.params.id,
        {
          agentname,
          whitelabel_user: whitelabelId || undefined,
          user,
          amount,
          prooftype: proofId || undefined,
          sportname: sportId || undefined,
          marketname: marketId || undefined,
          eventname,
          navigation,
          profitAndLoss,
          images: images || undefined,
          navigation2: navigation2 || undefined, 
          navigation2Images: navigation2ImagesData || undefined, 
        },
        { new: true, runValidators: true }
      )
        .populate('whitelabel_user', 'whitelabel_user user logo hexacode url')
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

    // Delete images if they exist
    if (client.images && client.images.length > 0) {
      client.images.forEach((image) => {
        const filePath = path.resolve(image.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete navigation2Images if they exist
    if (client.navigation2Images && client.navigation2Images.length > 0) {
      client.navigation2Images.forEach((image) => {
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
  } catch (error)    {
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
