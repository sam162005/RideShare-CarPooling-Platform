const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingConfirmation = async (bookingDetails) => {
    const { userEmail, rideDetails, bookingId } = bookingDetails;
    
    // Format the email content
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d3748;">🚗 Ride Booking Confirmed!</h2>
            <p>Hello,</p>
            <p>Your ride has been successfully booked. Here are your booking details:</p>
            
            <div style="background: #f7fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <h3 style="color: #2d3748; margin-top: 0;">Booking #${bookingId}</h3>
                <div style="display: flex; margin-bottom: 1rem;">
                    <div style="margin-right: 2rem;">
                        <p style="margin: 0.5rem 0; color: #4a5568;"><strong>From:</strong> ${rideDetails.pickupPoint.city}</p>
                        <p style="margin: 0.5rem 0; color: #4a5568;"><strong>To:</strong> ${rideDetails.dropoffPoint.city}</p>
                    </div>
                    <div>
                        <p style="margin: 0.5rem 0; color: #4a5568;"><strong>Date:</strong> ${rideDetails.date}</p>
                        <p style="margin: 0.5rem 0; color: #4a5568;"><strong>Time:</strong> ${rideDetails.time}</p>
                    </div>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 1rem; margin-top: 1rem;">
                    <p style="margin: 0.5rem 0; color: #4a5568;"><strong>Seats Booked:</strong> ${bookingDetails.seats}</p>
                    <p style="margin: 0.5rem 0; color: #4a5568;"><strong>Total Price:</strong> ₹${rideDetails.pricePerSeat * bookingDetails.seats}</p>
                </div>
            </div>
            
            <p>Thank you for choosing our service. Have a safe journey!</p>
            <p>Best regards,<br>RideShare Team</p>
        </div>
    `;

    // Email options
    const mailOptions = {
        from: `"RideShare" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '🚗 Your Ride Booking is Confirmed!',
        html: emailHtml
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        throw new Error('Failed to send confirmation email');
    }
};

module.exports = {
    sendBookingConfirmation
};
