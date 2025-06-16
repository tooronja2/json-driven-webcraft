import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.SHEETS_CLIENT_EMAIL,
    private_key: process.env.SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SHEET_ID;

export async function getBookings() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Reservas!A2:I',
  });
  return res.data.values || [];
}

export async function addBooking(row) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Reservas!A2:I',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

export async function updateBookingStatus(id, status) {
  const rows = await getBookings();
  const rowIndex = rows.findIndex(r => r[0] === id);
  if (rowIndex === -1) return;
  const range = `Reservas!I${rowIndex + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  });
}
export async function getBookingById(id) {
  const rows = await getBookings();
  const row = rows.find(r => r[0] === id);
  if (!row) return null;
  return {
    id: row[0],
    service: row[1],
    staffName: row[2],
    staffEmail: row[3],
    start: row[4],
    price: row[5],
    customerName: row[6],
    customerEmail: row[7],
    status: row[8],
  };
}
