
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Debug: Check which secrets are available
    console.log('Email service initialization:');
    console.log('GMAIL_USER available:', !!(process.env.GMAIL_USER || process.env.SMTP_USER));
    console.log('GMAIL_APP_PASSWORD available:', !!(process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS));
    
    // Configure Gmail SMTP with proper settings
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'your-app-password'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendWelcomeEmail(memberEmail: string, memberName: string, membershipTier: string) {
    const welcomeTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; border-radius: 10px; overflow: hidden;">
      <div style="background: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px;">Welcome to RESHAPE FITNESS!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #d4af37; margin-bottom: 20px;">Hello ${memberName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Congratulations and welcome to the RESHAPE FITNESS family! We're thrilled to have you join us on your fitness journey.
        </p>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Your Membership Details:</h3>
          <p style="margin: 10px 0;"><strong>Membership Plan:</strong> ${membershipTier}</p>
          <p style="margin: 10px 0;"><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <h3 style="color: #d4af37; margin-top: 30px;">What's Next?</h3>
        <ul style="line-height: 1.8; margin-bottom: 20px;">
          <li>Visit our facility for a complimentary body assessment</li>
          <li>Meet with one of our certified personal trainers</li>
          <li>Explore our group fitness classes and facilities</li>
          <li>Download our mobile app for easy booking and tracking</li>
        </ul>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Our team is here to support you every step of the way. If you have any questions, please don't hesitate to reach out.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started Today</a>
        </div>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 14px;">RESHAPE FITNESS | Transform Your Body, Transform Your Life</p>
      </div>
    </div>
    `;

    await this.sendEmail({
      to: memberEmail,
      subject: '🎉 Welcome to RESHAPE FITNESS - Let\'s Start Your Transformation!',
      html: welcomeTemplate
    });
  }

  async sendMembershipExpirationReminder(memberEmail: string, memberName: string, membershipTier: string, daysUntilExpiration: number) {
    const reminderTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; border-radius: 10px; overflow: hidden;">
      <div style="background: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px;">Membership Renewal Reminder</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #d4af37; margin-bottom: 20px;">Hello ${memberName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We hope you've been enjoying your fitness journey with RESHAPE FITNESS! 
        </p>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin-top: 0;">Important Notice:</h3>
          <p style="margin: 10px 0; font-size: 18px;"><strong>Your ${membershipTier} membership will expire in ${daysUntilExpiration} days.</strong></p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Don't let your progress stop! Renew your membership today and continue your transformation with:
        </p>
        <ul style="line-height: 1.8; margin-bottom: 20px;">
          <li>Continued access to all our premium facilities</li>
          <li>Personal training sessions with certified trainers</li>
          <li>Unlimited group fitness classes</li>
          <li>Nutrition guidance and meal planning</li>
        </ul>
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Renew Now</a>
          <a href="#" style="background: transparent; color: #d4af37; padding: 12px 24px; text-decoration: none; border-radius: 5px; border: 2px solid #d4af37;">Contact Us</a>
        </div>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 14px;">RESHAPE FITNESS | Your Transformation Partner</p>
      </div>
    </div>
    `;

    await this.sendEmail({
      to: memberEmail,
      subject: `⏰ Your ${membershipTier} Membership Expires in ${daysUntilExpiration} Days - Renew Now!`,
      html: reminderTemplate
    });
  }

  async sendContactConfirmationEmail(customerEmail: string, customerName: string, inquiryDetails: any) {
    const confirmationTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; border-radius: 10px; overflow: hidden;">
      <div style="background: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px;">Thank You for Contacting Us!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #d4af37; margin-bottom: 20px;">Hello ${customerName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Thank you for reaching out to RESHAPE FITNESS! We've received your inquiry and our team will get back to you within 24 hours.
        </p>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Your Inquiry Details:</h3>
          <p style="margin: 10px 0;"><strong>Interest:</strong> ${inquiryDetails.interest}</p>
          <p style="margin: 10px 0;"><strong>Location:</strong> ${inquiryDetails.location}</p>
          <p style="margin: 10px 0;"><strong>Message:</strong> ${inquiryDetails.message}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          In the meantime, feel free to explore our facilities and services on our website. We're excited to help you start your fitness transformation!
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Our Services</a>
        </div>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 14px;">RESHAPE FITNESS | Transform Your Body, Transform Your Life</p>
      </div>
    </div>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: '✅ We\'ve Received Your Inquiry - RESHAPE FITNESS',
      html: confirmationTemplate
    });
  }

  async sendAdminContactNotification(adminEmail: string, inquiryDetails: any) {
    const adminNotificationTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; border-radius: 10px; overflow: hidden;">
      <div style="background: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px;">New Contact Form Inquiry</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #d4af37; margin-bottom: 20px;">New Inquiry Received</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          A new contact form has been submitted on the RESHAPE FITNESS website.
        </p>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Customer Details:</h3>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${inquiryDetails.firstName} ${inquiryDetails.lastName}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${inquiryDetails.email}</p>
          <p style="margin: 10px 0;"><strong>Phone:</strong> ${inquiryDetails.phone}</p>
          <p style="margin: 10px 0;"><strong>Location:</strong> ${inquiryDetails.location}</p>
          <p style="margin: 10px 0;"><strong>Interest:</strong> ${inquiryDetails.interest}</p>
        </div>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Message:</h3>
          <p style="margin: 10px 0; line-height: 1.6;">${inquiryDetails.message}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          <strong>Submitted:</strong> ${new Date(inquiryDetails.submittedAt).toLocaleString()}
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Admin Dashboard</a>
        </div>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 14px;">RESHAPE FITNESS | Admin Notification</p>
      </div>
    </div>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: '🔔 New Contact Form Inquiry - RESHAPE FITNESS',
      html: adminNotificationTemplate
    });
  }

  private async sendEmail(options: EmailOptions) {
    try {
      // Verify transporter configuration
      await this.transporter.verify();
      console.log('SMTP server is ready to take our messages');
      
      const info = await this.transporter.sendMail({
        from: `"RESHAPE FITNESS" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@reshape.fitness'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });
      
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject
      });
      return info;
    } catch (error) {
      console.error('Error sending email:', {
        error: error.message,
        to: options.to,
        smtpUser: process.env.SMTP_USER || process.env.GMAIL_USER || 'not-set',
        smtpConfigured: !!(process.env.SMTP_USER || process.env.GMAIL_USER)
      });
      throw error;
    }
  }
}

export const emailService = new EmailService();
