package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.model.Booking;
import com.Vishal.BookMyShow.model.ShowSeat;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:patelcode24@gmail.com}")
    private String fromEmail;

    public void sendBookingConfirmationEmail(Booking booking, List<ShowSeat> seats) {
        if (mailSender == null || booking == null || booking.getUser() == null || booking.getUser().getEmail() == null) {
            System.err.println("⚠️ MailSender or User email missing. Skipping email dispatch.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String recipientEmail = booking.getUser().getEmail();
            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("🎬 Ticket Invoice & Booking Confirmation - " + booking.getShow().getMovie().getTitle());

            String seatNumbers = (seats != null && !seats.isEmpty()) ? seats.stream()
                    .map(s -> s.getSeat().getSeatNumber())
                    .collect(Collectors.joining(", ")) : "N/A";

            String movieTitle = booking.getShow().getMovie().getTitle();
            String language = booking.getShow().getMovie().getLanguage() != null ? booking.getShow().getMovie().getLanguage() : "Hindi";
            String genre = booking.getShow().getMovie().getGenre() != null ? booking.getShow().getMovie().getGenre() : "Cinema";
            String theaterName = booking.getShow().getScreen().getTheater().getName();
            String screenName = booking.getShow().getScreen().getName();
            String city = booking.getShow().getScreen().getTheater().getCity();
            String address = booking.getShow().getScreen().getTheater().getAddress();

            String showTimeFormatted = "N/A";
            if (booking.getShow().getStartTime() != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
                showTimeFormatted = booking.getShow().getStartTime().format(formatter);
            }

            String htmlBody = "<html><body style='font-family: Arial, sans-serif; background-color: #0f0f0f; color: #ffffff; padding: 20px;'>"
                    + "<div style='max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 16px; padding: 28px; border: 1px solid #dc2626; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.2);'>"
                    + "<div style='text-align: center; margin-bottom: 20px;'>"
                    + "<h1 style='color: #ef4444; margin: 0; font-size: 24px;'>🎟️ CineDuniya Ticket Invoice</h1>"
                    + "<p style='color: #10b981; font-weight: bold; margin-top: 4px; font-size: 14px;'>STATUS: PAID & CONFIRMED</p>"
                    + "</div>"
                    + "<hr style='border-color: #262626; margin: 20px 0;'/>"
                    + "<table style='width: 100%; border-collapse: collapse; font-size: 14px; color: #e5e5e5;'>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Booking ID:</td><td style='font-weight: bold; color: #f59e0b; text-align: right; font-family: monospace; font-size: 15px;'>" + booking.getBookingNumber() + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Customer Name:</td><td style='font-weight: bold; text-align: right;'>" + booking.getUser().getName() + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Customer Email:</td><td style='text-align: right;'>" + recipientEmail + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Movie:</td><td style='font-weight: bold; color: #ffffff; text-align: right; font-size: 16px;'>" + movieTitle + " (" + language + ")</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Genre:</td><td style='text-align: right;'>" + genre + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Cinema Venue:</td><td style='font-weight: bold; text-align: right;'>" + theaterName + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Screen / Audi:</td><td style='text-align: right; color: #f59e0b; font-weight: bold;'>" + screenName + " (" + city + ")</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Venue Address:</td><td style='text-align: right; font-size: 12px; color: #a3a3a3;'>" + address + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Show Date & Time:</td><td style='font-weight: bold; color: #60a5fa; text-align: right;'>" + showTimeFormatted + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Booked Seats:</td><td style='font-weight: bold; color: #ef4444; text-align: right; font-size: 16px;'>" + seatNumbers + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #a3a3a3;'>Total Invoice Paid:</td><td style='font-weight: bold; color: #10b981; text-align: right; font-size: 20px;'>₹" + booking.getTotalAmount() + "</td></tr>"
                    + "</table>"
                    + "<hr style='border-color: #262626; margin: 20px 0;'/>"
                    + "<div style='text-align: center; color: #a3a3a3; font-size: 12px;'>"
                    + "<p>Please present this digital invoice email or Booking ID at the theater entry gate.</p>"
                    + "<p style='color: #ef4444; font-weight: bold;'>Thank you for choosing CineDuniya BookMyShow!</p>"
                    + "</div>"
                    + "</div></body></html>";

            helper.setText(htmlBody, true);
            mailSender.send(message);
            System.out.println("✅ Detailed ticket invoice email sent successfully to: " + recipientEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send ticket invoice email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Unexpected error sending ticket invoice email: " + e.getMessage());
        }
    }
}
