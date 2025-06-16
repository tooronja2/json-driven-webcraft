import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendCustomerEmail(data) {
  const html = `
    <h2>Reserva confirmada</h2>
    <p>Hola ${data.customerName}, tu turno para <b>${data.service}</b> con <b>${data.staffName}</b> fue agendado para <b>${data.start}</b>.</p>
    <p>Total: <b>${data.price}</b></p>
    <p>Si deseas cancelar haz clic <a href="${data.cancelUrl}">aquí</a>.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.customerEmail,
    subject: 'Confirmación de reserva',
    html,
  });
}

export async function notifyStaffEmail(data) {
  const html = `
    <h2>Nuevo turno reservado</h2>
    <p>Servicio: <b>${data.service}</b></p>
    <p>Cliente: <b>${data.customerName}</b> (${data.customerEmail})</p>
    <p>Fecha y hora: <b>${data.start}</b></p>
    <p>Total: <b>${data.price}</b></p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.staffEmail,
    subject: 'Nuevo turno agendado',
    html,
  });
}

export async function notifyCancellation(data) {
  const html = `
    <h2>Reserva cancelada</h2>
    <p>El cliente <b>${data.customerName}</b> canceló su turno para <b>${data.service}</b> del día <b>${data.start}</b>.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.staffEmail,
    subject: 'Turno cancelado',
    html,
  });
}

export async function sendCancellationToCustomer(data) {
  const html = `
    <h2>Tu reserva fue cancelada</h2>
    <p>Hola ${data.customerName}, has cancelado tu turno para <b>${data.service}</b> con <b>${data.staffName}</b> del día <b>${data.start}</b>.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.customerEmail,
    subject: 'Cancelación de reserva',
    html,
  });
}
