require('dotenv').config();
const nodemailer = require("nodemailer");

async function sendVerificationEmail(toEmail, token) {
  // Validar que las variables de entorno estén configuradas
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️ Variables de email no completamente configuradas.');
    return { success: true, message: 'Email service no configurado (modo desarrollo)' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const verifyUrl = `http://localhost:4200/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to: toEmail,
    subject: "Verifica tu correo electrónico",
    html: `
      <h2>Verificación de Correo Electrónico</h2>
      <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verificar Correo
      </a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${verifyUrl}</p>
      <p>Este enlace expira en 15 minutos.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email enviado correctamente' };
  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    throw new Error('No se pudo enviar el email de verificación: ' + error.message);
  }
}

module.exports = { sendVerificationEmail };