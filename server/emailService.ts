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

    // Check if email credentials are available
    const hasEmailCredentials = !!(process.env.SMTP_USER || process.env.GMAIL_USER) && 
                               !!(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);

    if (hasEmailCredentials) {
      // Configure Gmail SMTP with proper settings
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || process.env.GMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      // Create a mock transporter for development
      console.log('Email credentials not configured - using mock transporter');
      this.transporter = {
        verify: async () => true,
        sendMail: async (options: any) => {
          console.log('Mock email sent:', {
            to: options.to,
            subject: options.subject,
            from: options.from
          });
          return { messageId: 'mock-' + Date.now() };
        }
      } as any;
    }
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

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;

    const resetTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; border-radius: 10px; overflow: hidden;">
      <div style="background: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px;">Password Reset Request</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #d4af37; margin-bottom: 20px;">Hello ${userName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset your password for your RESHAPE FITNESS account.
        </p>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin-top: 0;">Important Security Notice:</h3>
          <p style="margin: 10px 0;">• This link will expire in 15 minutes</p>
          <p style="margin: 10px 0;">• This link can only be used once</p>
          <p style="margin: 10px 0;">• If you didn't request this reset, please ignore this email</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #d4af37; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; color: #888;">
          If the button doesn't work, copy and paste this link into your browser:
          <br><a href="${resetUrl}" style="color: #d4af37; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 14px;">RESHAPE FITNESS | Secure Account Management</p>
      </div>
    </div>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: '🔒 Password Reset Request - RESHAPE FITNESS',
      html: resetTemplate
    });
  }

  async sendEmailChangeConfirmation(newEmail: string, userName: string, changeToken: string, oldEmail: string) {
    const confirmUrl = `${process.env.APP_URL || 'http://localhost:5000'}/confirm-email-change?token=${changeToken}`;

    const confirmTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; border-radius: 10px; overflow: hidden;">
      <div style="background: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px;">Email Change Confirmation</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #d4af37; margin-bottom: 20px;">Hello ${userName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We received a request to change your email address for your RESHAPE FITNESS account.
        </p>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Email Change Details:</h3>
          <p style="margin: 10px 0;"><strong>Current Email:</strong> ${oldEmail}</p>
          <p style="margin: 10px 0;"><strong>New Email:</strong> ${newEmail}</p>
        </div>
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin-top: 0;">Important Security Notice:</h3>
          <p style="margin: 10px 0;">• This link will expire in 30 minutes</p>
          <p style="margin: 10px 0;">• This link can only be used once</p>
          <p style="margin: 10px 0;">• If you didn't request this change, please ignore this email</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Click the button below to confirm your new email address:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="background: #d4af37; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirm Email Change</a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; color: #888;">
          If the button doesn't work, copy and paste this link into your browser:
          <br><a href="${confirmUrl}" style="color: #d4af37; word-break: break-all;">${confirmUrl}</a>
        </p>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 14px;">RESHAPE FITNESS | Secure Account Management</p>
      </div>
    </div>
    `;

    await this.sendEmail({
      to: newEmail,
      subject: '✉️ Confirm Email Change - RESHAPE FITNESS',
      html: confirmTemplate
    });
  }

  async sendBodyAssessmentToTrainer(trainerEmail: string, trainerName: string, assessmentDetails: any) {
    const assessmentTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; border-radius: 10px; overflow: hidden;">
      <div style="background: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px;">Body Assessment Shared with You</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #d4af37; margin-bottom: 20px;">Hello ${trainerName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          A body assessment has been shared with you for review and training guidance.
        </p>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Client Information:</h3>
          <p style="margin: 10px 0;"><strong>Client Name:</strong> ${assessmentDetails.memberName || assessmentDetails.clientName}</p>
          <p style="margin: 10px 0;"><strong>Age:</strong> ${assessmentDetails.age} years</p>
          <p style="margin: 10px 0;"><strong>Date of Birth:</strong> ${assessmentDetails.dateOfBirth ? new Date(assessmentDetails.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Emergency Contact:</strong> ${assessmentDetails.emergencyContact || 'N/A'}</p>
        </div>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Physical Measurements:</h3>
          <p style="margin: 10px 0;"><strong>Height:</strong> ${assessmentDetails.height} cm</p>
          <p style="margin: 10px 0;"><strong>Weight:</strong> ${assessmentDetails.bodyComposition?.weight || 'N/A'} kg</p>
          <p style="margin: 10px 0;"><strong>BMI:</strong> ${assessmentDetails.bodyComposition?.bmi || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Blood Pressure:</strong> ${assessmentDetails.bloodPressure || assessmentDetails.bp || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>BP After Treadmill:</strong> ${assessmentDetails.afterTreadmillBP || assessmentDetails.bp_after_treadmill || 'N/A'}</p>
        </div>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Body Composition:</h3>
          <p style="margin: 10px 0;"><strong>Muscle Mass:</strong> ${assessmentDetails.bodyComposition?.muscle || 'N/A'}%</p>
          <p style="margin: 10px 0;"><strong>Body Fat:</strong> ${assessmentDetails.bodyComposition?.fat || 'N/A'}%</p>
          <p style="margin: 10px 0;"><strong>Visceral Fat:</strong> ${assessmentDetails.bodyComposition?.visceralFat || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>BMR:</strong> ${assessmentDetails.bodyComposition?.bmr || 'N/A'} calories</p>
          <p style="margin: 10px 0;"><strong>Body Age:</strong> ${assessmentDetails.bodyComposition?.bodyAge || 'N/A'} years</p>
        </div>

        ${assessmentDetails.posturalAssessment ? `
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Postural Assessment:</h3>
          <p style="margin: 10px 0;"><strong>Head/Neck Alignment:</strong> ${assessmentDetails.posturalAssessment.headNeckAlignment || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Shoulder Alignment:</strong> ${assessmentDetails.posturalAssessment.shoulderAlignment || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Upper Back:</strong> ${assessmentDetails.posturalAssessment.upperBackAlignment || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Lower Back:</strong> ${assessmentDetails.posturalAssessment.lowerBackAlignment || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Pelvic Alignment:</strong> ${assessmentDetails.posturalAssessment.pelvicAlignment || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Hip/Knee Alignment:</strong> ${assessmentDetails.posturalAssessment.hipKneeAlignment || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Ankle Alignment:</strong> ${assessmentDetails.posturalAssessment.ankleAlignment || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Spinal Mobility:</strong> ${assessmentDetails.posturalAssessment.spinalMobility || 'N/A'}</p>
        </div>
        ` : ''}

        ${assessmentDetails.circumferenceMeasurements ? `
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Circumference Measurements:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p style="margin: 5px 0;"><strong>Neck:</strong> ${assessmentDetails.circumferenceMeasurements.neck || 'N/A'} cm</p>
            <p style="margin: 5px 0;"><strong>Shoulders:</strong> ${assessmentDetails.circumferenceMeasurements.shoulders || 'N/A'} cm</p>
            <p style="margin: 5px 0;"><strong>Chest:</strong> ${assessmentDetails.circumferenceMeasurements.chest || 'N/A'} cm</p>
            <p style="margin: 5px 0;"><strong>Upper Arm:</strong> ${assessmentDetails.circumferenceMeasurements.upperArm || 'N/A'} cm</p>
            <p style="margin: 5px 0;"><strong>Waist:</strong> ${assessmentDetails.circumferenceMeasurements.waist || 'N/A'} cm</p>
            <p style="margin: 5px 0;"><strong>Hip:</strong> ${assessmentDetails.circumferenceMeasurements.hip || 'N/A'} cm</p>
            <p style="margin: 5px 0;"><strong>Thighs:</strong> ${assessmentDetails.circumferenceMeasurements.thighs || 'N/A'} cm</p>
            <p style="margin: 5px 0;"><strong>Calf:</strong> ${assessmentDetails.circumferenceMeasurements.calf || 'N/A'} cm</p>
          </div>
        </div>
        ` : ''}

        ${assessmentDetails.advice ? `
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Additional Notes/Advice:</h3>
          <p style="margin: 10px 0; line-height: 1.6;">${assessmentDetails.advice}</p>
        </div>
        ` : ''}

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          <strong>Assessment Date:</strong> ${new Date(assessmentDetails.createdAt || Date.now()).toLocaleDateString()}
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Please review this assessment and provide appropriate training recommendations for this client.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Trainer Dashboard</a>
        </div>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 14px;">RESHAPE FITNESS | Body Assessment Sharing</p>
      </div>
    </div>
    `;

    await this.sendEmail({
      to: trainerEmail,
      subject: `📊 Body Assessment Shared - ${assessmentDetails.memberName || assessmentDetails.clientName} | RESHAPE FITNESS`,
      html: assessmentTemplate
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