
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
   
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing email credentials in environment variables.');
    }

    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendBookingConfirmation(reservationId) {
    try {
      const reservation = await this.getReservationDetails(reservationId);

     
      if (!reservation?.user?.email) {
        throw new Error('User email not found in reservation details.');
      }

      const emailData = {
        from: process.env.EMAIL_USER,
        to: reservation.user.email,
        subject: '🎬 Booking Confirmed - Movie Reservation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e50914; text-align: center;">🎬 Booking Confirmed!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${reservation.showtime.movie.title}</h3>
              <p><strong>📅 Date:</strong> ${new Date(reservation.showtime.show_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              <p><strong>🕐 Time:</strong> ${reservation.showtime.show_time}</p>
              <p><strong>🎭 Theater:</strong> ${reservation.showtime.hall.theater.name}</p>
              <p><strong>🎪 Hall:</strong> ${reservation.showtime.hall.name}</p>
              <p><strong>💺 Seats:</strong> ${reservation.selectedSeats.join(', ')}</p>
              <p><strong>💰 Total Amount:</strong> ₹${reservation.totalAmount}</p>
              <p><strong>📋 Status:</strong> ${reservation.status.toUpperCase()}</p>
            </div>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724;">
                <strong>Important:</strong> Please arrive 15 minutes before showtime. 
                Show this email as your ticket confirmation.
              </p>
            </div>
            
            <p style="text-align: center; margin-top: 30px; color: #666;">
              Thank you for choosing our cinema! 🍿
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(emailData);
      
    
      console.log(`✅ Booking confirmation sent to user with reservation ID: ${reservationId}`);
      
      return { success: true };
    } catch (error) {
     
      console.error(`❌ Email sending failed for reservation ${reservationId}:`, error.message);
      throw error;
    }
  }

  async sendShowtimeReminder(reservationId) {
    try {
      const reservation = await this.getReservationDetails(reservationId);

     
      if (!reservation?.user?.email) {
        throw new Error('User email not found in reservation details.');
      }

      const emailData = {
        from: process.env.EMAIL_USER,
        to: reservation.user.email,
        subject: '⏰ Showtime Reminder - Your Movie Starts Soon!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ff6b35; text-align: center;">⏰ Showtime Reminder</h2>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #333; margin-top: 0;">${reservation.showtime.movie.title}</h3>
              <p style="font-size: 18px; color: #856404;"><strong>🕐 Starts in 2 hours!</strong></p>
              <p><strong>📅 Date:</strong> ${new Date(reservation.showtime.show_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              <p><strong>🕐 Time:</strong> ${reservation.showtime.show_time}</p>
              <p><strong>🎭 Theater:</strong> ${reservation.showtime.hall.theater.name}</p>
              <p><strong>🎪 Hall:</strong> ${reservation.showtime.hall.name}</p>
              <p><strong>💺 Your Seats:</strong> ${reservation.selectedSeats.join(', ')}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; color: #333;">
                🚗 Don't forget to leave early for traffic!<br>
                🎫 Bring this email as your ticket confirmation
              </p>
            </div>
            
            <p style="text-align: center; color: #666;">
              Enjoy your movie! 🍿🎬
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(emailData);
      
     
      console.log(`✅ Showtime reminder sent to user with reservation ID: ${reservationId}`);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Reminder sending failed for reservation ${reservationId}:`, error.message);
      throw error;
    }
  }

  
  async getReservationDetails(reservationId) {
    
    const { Reservation, User, Showtime, Movie, Hall, Theater } = require('../models');
    
    try {
      const reservation = await Reservation.findByPk(reservationId, {
        include: [
          { 
            model: User, 
            as: 'user',
            attributes: ['id', 'name', 'email'] 
          },
          {
            model: Showtime,
            as: 'showtime',
            include: [
              { 
                model: Movie, 
                as: 'movie',
                attributes: ['id', 'title', 'genre', 'duration', 'certification']
              },
              {
                model: Hall,
                as: 'hall',
                attributes: ['id', 'name', 'format_type'],
                include: [{ 
                  model: Theater, 
                  as: 'theater',
                  attributes: ['id', 'name', 'address', 'city']
                }]
              }
            ]
          }
        ]
      });

      if (!reservation) {
        throw new Error(`Reservation with ID ${reservationId} not found`);
      }

      return reservation;
    } catch (error) {
      console.error(`❌ Failed to fetch reservation details for ID ${reservationId}:`, error.message);
      throw error;
    }
  }


  async validateEmailService() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service validation failed:', error.message);
      return false;
    }
  }

  
  async sendPaymentConfirmation(reservationId, paymentDetails) {
    try {
      const reservation = await this.getReservationDetails(reservationId);

      if (!reservation?.user?.email) {
        throw new Error('User email not found in reservation details.');
      }

      const emailData = {
        from: process.env.EMAIL_USER,
        to: reservation.user.email,
        subject: '💳 Payment Confirmed - Movie Reservation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28a745; text-align: center;">💳 Payment Confirmed!</h2>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Payment Successful</h3>
              <p><strong>💰 Amount Paid:</strong> ₹${reservation.totalAmount}</p>
              <p><strong>🆔 Payment ID:</strong> ${paymentDetails.paymentId}</p>
              <p><strong>📋 Order ID:</strong> ${paymentDetails.orderId}</p>
              <p><strong>⏰ Paid At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Movie Details</h3>
              <p><strong>🎬 Movie:</strong> ${reservation.showtime.movie.title}</p>
              <p><strong>📅 Date:</strong> ${new Date(reservation.showtime.show_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              <p><strong>🕐 Time:</strong> ${reservation.showtime.show_time}</p>
              <p><strong>🎭 Theater:</strong> ${reservation.showtime.hall.theater.name}</p>
              <p><strong>💺 Seats:</strong> ${reservation.selectedSeats.join(', ')}</p>
            </div>
            
            <p style="text-align: center; margin-top: 30px; color: #666;">
              Your tickets are confirmed! See you at the movies! 🎬🍿
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(emailData);
      
      console.log(`✅ Payment confirmation sent to user with reservation ID: ${reservationId}`);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Payment confirmation email failed for reservation ${reservationId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new NotificationService();
