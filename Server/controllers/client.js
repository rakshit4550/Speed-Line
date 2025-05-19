import Client from '../models/Client.js';
import { whitelabel } from '../models/WhiteLabel.js';
import ProofType from '../models/Proof.js';
import Sport from '../models/Sports.js';
import Market from '../models/Market.js';
import puppeteer from 'puppeteer';

export const generatePreviewPDF = async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('Received HTML for PDF generation:', html.substring(0, 500) + '...'); // Log first 500 chars

    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Handle image loading errors
    page.on('requestfailed', (request) => {
      console.warn(`Failed to load resource: ${request.url()}`);
    });

    // Set viewport to match the preview container's width (50vh ≈ 540px)
    await page.setViewport({
      width: 540,
      height: 1,
      deviceScaleFactor: 1,
    });

    console.log('Setting HTML content...');
    // Set the HTML content with increased timeout
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000, // 60 seconds
    });

    // Wait for images to load
    await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if image fails
              })
        )
      );
    });

    console.log('Calculating content height...');
    // Get the height of the content
    const contentHeight = await page.evaluate(() => {
      const container = document.querySelector('.preview-container');
      return container ? container.offsetHeight : 800;
    });

    console.log(`Content height: ${contentHeight}px`);

    // Generate PDF with custom dimensions
    const pdfBuffer = await page.pdf({
      width: '540px',
      height: `${contentHeight + 50}px`, // Increased padding
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    console.log('PDF generated successfully');

    // Close the browser
    await browser.close();

    // Set response headers
    res.setHeader('Content-Disposition', 'attachment; filename="client-preview.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const { agentname, username, amount, prooftype, sportname, marketname, profitAndLoss } = req.body;

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

    const client = new Client({
      agentname,
      username: whitelabelInstance._id,
      amount,
      prooftype: proof._id,
      sportname: sport._id,
      marketname: market._id,
      profitAndLoss,
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
  try {
    const { agentname, username, amount, prooftype, sportname, marketname, profitAndLoss } = req.body;

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

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        agentname,
        username: whitelabelId || undefined,
        amount,
        prooftype: proofId || undefined,
        sportname: sportId || undefined,
        marketname: marketId || undefined,
        profitAndLoss,
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
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
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