
const cron = require('node-cron');
const NotificationService = require('./notification.service');

const { Op } = require('sequelize');
const { Reservation, Showtime, Movie, Hall, Theater, User } = require('../models');

class SchedulerService {
  start() {
    // Run every hour to check for upcoming showtimes
    cron.schedule('0 * * * *', async () => {
      console.log('🕐 Running showtime reminder check...');
      try {
        await this.checkUpcomingShowtimes();
      } catch (error) {
        console.error('Scheduler error:', error.message);
      }
    });

    console.log('✅ Scheduler started - checking for reminders every hour');
  }

  async checkUpcomingShowtimes() {
    const { Reservation, Showtime } = require('../models');
    
    // Calculate time 2 hours from now
    const twoHoursFromNow = new Date();
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

    // Find reservations with showtimes in 2 hours
    const upcomingReservations = await Reservation.findAll({
      where: {
        status: 'confirmed',
        reminderSent: { [Op.or]: [false, null] }
      },
      include: [{
        model: Showtime,
        as: 'showtime',
        where: {
          showDate: twoHoursFromNow.toISOString().split('T')[0],
          showTime: {
            [Op.between]: [
              twoHoursFromNow.toTimeString().split(' ')[0],
              new Date(twoHoursFromNow.getTime() + 10 * 60000).toTimeString().split(' ')[0] // 10 min window
            ]
          }
        }
      }]
    });

    console.log(`Found ${upcomingReservations.length} reservations needing reminders`);

    // Send reminders
    for (const reservation of upcomingReservations) {
      try {
        await NotificationService.sendShowtimeReminder(reservation.id);
        await reservation.update({ reminderSent: true });
        console.log(`✅ Reminder sent for reservation ${reservation.id}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for reservation ${reservation.id}:`, error.message);
      }
    }
  }

  // Manual trigger for testing
  async triggerReminderCheck() {
    console.log('🧪 Manual reminder check triggered');
    await this.checkUpcomingShowtimes();
  }
}

module.exports = new SchedulerService();
