/**
 * Google Apps Script backend for premium shop + admin portal.
 *
 * Required Google Sheets structure:
 * 1) Sheet: Products -> Header row: ID | Name | Price
 * 2) Sheet: Admins   -> Header row: Username | Password
 */

const SHEET_PRODUCTS = 'Products';
const SHEET_ADMINS = 'Admins';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : '';

    if (action === 'getProducts') {
      return jsonResponse({ success: true, products: getProducts_() });
    }

    return jsonResponse({
      success: true,
      message: 'Shop API is running.',
      usage: {
        postActions: ['getProducts', 'login', 'updatePrice'],
        getActions: ['getProducts']
      }
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || 'Unexpected doGet error' });
  }
}

function doPost(e) {
  try {
    const payload = parseBody_(e);
    const action = payload.action ? String(payload.action).trim() : '';

    if (!action) {
      return jsonResponse({ success: false, message: 'Missing action parameter.' });
    }

    if (action === 'getProducts') {
      return jsonResponse({ success: true, products: getProducts_() });
    }

    if (action === 'login') {
      return handleLogin_(payload);
    }

    if (action === 'updatePrice') {
      return handleUpdatePrice_(payload);
    }

    return jsonResponse({ success: false, message: 'Invalid action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || 'Unexpected doPost error' });
  }
}

function handleLogin_(payload) {
  const username = payload.username ? String(payload.username).trim() : '';
  const password = payload.password ? String(payload.password).trim() : '';

  if (!username || !password) {
    return jsonResponse({ success: false, message: 'Username and password are required.' });
  }

  const sheet = getSheetOrThrow_(SHEET_ADMINS);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return jsonResponse({ success: false, message: 'No admin credentials found in Admins sheet.' });
  }

  for (let i = 1; i < values.length; i++) {
    const rowUsername = String(values[i][0] || '').trim();
    const rowPassword = String(values[i][1] || '').trim();

    if (rowUsername === username && rowPassword === password) {
      return jsonResponse({
        success: true,
        message: 'Login successful.',
        user: { username: rowUsername }
      });
    }
  }

  return jsonResponse({ success: false, message: 'Invalid username or password.' });
}

function handleUpdatePrice_(payload) {
  const productId = payload.productId ? String(payload.productId).trim() : '';
  const newPriceRaw = payload.newPrice;
  const newPrice = Number(newPriceRaw);

  if (!productId) {
    return jsonResponse({ success: false, message: 'productId is required.' });
  }

  if (newPriceRaw === undefined || newPriceRaw === null || Number.isNaN(newPrice) || newPrice < 0) {
    return jsonResponse({ success: false, message: 'newPrice must be a valid non-negative number.' });
  }

  const sheet = getSheetOrThrow_(SHEET_PRODUCTS);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return jsonResponse({ success: false, message: 'Products sheet is empty.' });
  }

  for (let i = 1; i < values.length; i++) {
    const rowId = String(values[i][0] || '').trim();

    if (rowId === productId) {
      sheet.getRange(i + 1, 3).setValue(newPrice);
      return jsonResponse({
        success: true,
        message: `Price updated for product ${productId}.`,
        data: {
          productId: productId,
          newPrice: newPrice
        }
      });
    }
  }

  return jsonResponse({ success: false, message: `Product ID ${productId} not found.` });
}

function getProducts_() {
  const sheet = getSheetOrThrow_(SHEET_PRODUCTS);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const products = [];

  for (let i = 1; i < values.length; i++) {
    const id = String(values[i][0] || '').trim();
    const name = String(values[i][1] || '').trim();
    const price = Number(values[i][2]);

    if (!id && !name) {
      continue;
    }

    products.push({
      id: id || `ROW-${i + 1}`,
      name: name || 'Unnamed Product',
      price: Number.isNaN(price) ? 0 : price
    });
  }

  return products;
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  const raw = e.postData.contents;
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Request body must be valid JSON.');
  }
}

function getSheetOrThrow_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('No active spreadsheet found. Bind script to a Google Sheet.');
  }

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
