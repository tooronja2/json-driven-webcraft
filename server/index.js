import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { addBooking, updateBookingStatus, getBookingById } from './services/sheets.js';
import { sendCustomerEmail, notifyStaffEmail, notifyCancellation, sendCancellationToCustomer } from './services/email.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/book', async (req, res) => {
  try {
    const { service, staffName, staffEmail, start, price, customerName, customerEmail } = req.body;
    const id = uuidv4();
    const row = [id, service, staffName, staffEmail, start, price, customerName, customerEmail, 'reservado'];
    await addBooking(row);
    const cancelUrl = `${req.protocol}://${req.get('host')}/api/cancel/${id}`;
    await sendCustomerEmail({ service, staffName, start, price, customerName, customerEmail, cancelUrl });
    await notifyStaffEmail({ service, staffName, staffEmail, start, price, customerName, customerEmail });
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

app.get('/api/cancel/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await updateBookingStatus(id, 'cancelado');
    const booking = await getBookingById(id);
    if (booking) {
      await notifyCancellation({
        service: booking.service,
        staffName: booking.staffName,
        staffEmail: booking.staffEmail,
        start: booking.start,
        customerName: booking.customerName,
      });
      await sendCancellationToCustomer({
        service: booking.service,
        staffName: booking.staffName,
        start: booking.start,
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
      });
    }
    res.send('Reserva cancelada');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cancelar');
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on ${port}`));
