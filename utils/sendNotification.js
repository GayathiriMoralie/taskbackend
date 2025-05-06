// const nodemailer = require('nodemailer');

// const sendNotification = async (task, status) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'gayathirimoralie@gmail.com',
//       pass: 'your-email-password'
//     }
//   });

//   const mailOptions = {
//     from: 'your-email@example.com',
//     to: task.assigned_to.email,  // assuming the user has an email field
//     subject: 'Task Status Update',
//     text: `The status of the task "${task.title}" has been updated to "${status}".`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error('Error sending notification:', error);
//   }
// };

// module.exports = sendNotification;
