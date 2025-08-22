
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { pool } from './db.js';
import { emailService } from './emailService.js';

interface ResetToken {
  id: string;
  userId: string;
  token: string;
  type: 'password_reset' | 'email_change';
  newEmail?: string;
  expiresAt: Date;
  used: boolean;
}

export class AuthService {
  // Generate a secure token for password reset or email change
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash password using bcrypt
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password using bcrypt
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Create password reset token
  async createPasswordResetToken(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      const { rows: userRows } = await pool.query('SELECT id, first_name, last_name FROM users WHERE email = $1', [email]);
      
      if (userRows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const user = userRows[0];
      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store token in database
      await pool.query(`
        INSERT INTO auth_tokens (user_id, token, type, expires_at, used) 
        VALUES ($1, $2, $3, $4, $5)
      `, [user.id, token, 'password_reset', expiresAt, false]);

      // Send password reset email
      await emailService.sendPasswordResetEmail(email, `${user.first_name} ${user.last_name}`, token);

      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Error creating password reset token:', error);
      return { success: false, message: 'Failed to send password reset email' };
    }
  }

  // Verify and use password reset token
  async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string; message: string }> {
    try {
      const { rows } = await pool.query(`
        SELECT id, user_id, expires_at, used 
        FROM auth_tokens 
        WHERE token = $1 AND type = $2
      `, [token, 'password_reset']);

      if (rows.length === 0) {
        return { valid: false, message: 'Invalid reset token' };
      }

      const tokenData = rows[0];

      if (tokenData.used) {
        return { valid: false, message: 'Reset token has already been used' };
      }

      if (new Date() > new Date(tokenData.expires_at)) {
        return { valid: false, message: 'Reset token has expired' };
      }

      return { valid: true, userId: tokenData.user_id.toString(), message: 'Token is valid' };
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return { valid: false, message: 'Failed to verify token' };
    }
  }

  // Reset password using token
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const verification = await this.verifyPasswordResetToken(token);
      
      if (!verification.valid) {
        return { success: false, message: verification.message };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password and mark token as used
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
          [hashedPassword, verification.userId]);

        await client.query('UPDATE auth_tokens SET used = true WHERE token = $1', [token]);

        await client.query('COMMIT');

        return { success: true, message: 'Password reset successfully' };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }

  // Create email change token
  async createEmailChangeToken(userId: string, newEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if new email already exists
      const { rows: existingRows } = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, userId]);
      
      if (existingRows.length > 0) {
        return { success: false, message: 'Email address is already in use' };
      }

      // Get user details
      const { rows: userRows } = await pool.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [userId]);
      
      if (userRows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const user = userRows[0];
      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store token in database
      await pool.query(`
        INSERT INTO auth_tokens (user_id, token, type, new_email, expires_at, used) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, token, 'email_change', newEmail, expiresAt, false]);

      // Send email change confirmation to new email
      await emailService.sendEmailChangeConfirmation(newEmail, `${user.first_name} ${user.last_name}`, token, user.email);

      return { success: true, message: 'Email change confirmation sent to new email address' };
    } catch (error) {
      console.error('Error creating email change token:', error);
      return { success: false, message: 'Failed to send email change confirmation' };
    }
  }

  // Confirm email change
  async confirmEmailChange(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const { rows } = await pool.query(`
        SELECT id, user_id, new_email, expires_at, used 
        FROM auth_tokens 
        WHERE token = $1 AND type = $2
      `, [token, 'email_change']);

      if (rows.length === 0) {
        return { success: false, message: 'Invalid email change token' };
      }

      const tokenData = rows[0];

      if (tokenData.used) {
        return { success: false, message: 'Email change token has already been used' };
      }

      if (new Date() > new Date(tokenData.expires_at)) {
        return { success: false, message: 'Email change token has expired' };
      }

      // Update user email and mark token as used
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query('UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
          [tokenData.new_email, tokenData.user_id]);

        await client.query('UPDATE auth_tokens SET used = true WHERE token = $1', [token]);

        await client.query('COMMIT');

        return { success: true, message: 'Email address changed successfully' };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error confirming email change:', error);
      return { success: false, message: 'Failed to change email address' };
    }
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await pool.query('DELETE FROM auth_tokens WHERE expires_at < CURRENT_TIMESTAMP OR used = true');
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}

export const authService = new AuthService();
