// Email Notification Templates and Service
// ใช้สำหรับส่ง email แจ้งเตือนต่างๆ ในระบบ ATS

/**
 * Email Templates
 * รูปแบบ email ที่จะส่งออกไป
 */

export const emailTemplates = {
  // 1. แจ้งเตือนเมื่อสมัครงานสำเร็จ
  applicationSubmitted: {
    subject: (jobTitle) => `ยืนยันการสมัครงาน: ${jobTitle}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">✅ สมัครงานสำเร็จ</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>เราได้รับใบสมัครของคุณสำหรับตำแหน่ง <strong>${data.jobTitle}</strong> เรียบร้อยแล้ว</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">รายละเอียดการสมัคร</h3>
          <p><strong>ตำแหน่ง:</strong> ${data.jobTitle}</p>
          <p><strong>แผนก:</strong> ${data.department}</p>
          <p><strong>วันที่สมัคร:</strong> ${data.submittedDate}</p>
          <p><strong>เลขที่ใบสมัคร:</strong> ${data.applicationId}</p>
        </div>

        <h3>ขั้นตอนถัดไป</h3>
        <ol>
          <li>ทีม HR จะตรวจสอบใบสมัครของคุณ (1-3 วันทำการ)</li>
          <li>คุณจะได้รับการติดต่อกลับหากผ่านการคัดเลือกเบื้องต้น</li>
          <li>ติดตามสถานะได้ผ่านระบบตลอดเวลา</li>
        </ol>

        <p style="margin-top: 30px;">
          <a href="${data.trackUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ติดตามสถานะการสมัคร
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          หากมีคำถาม กรุณาติดต่อ: <a href="mailto:hr@company.com">hr@company.com</a>
        </p>
      </div>
    `,
  },

  // 2. แจ้งเตือนเมื่อสถานะเปลี่ยน
  statusUpdate: {
    subject: (status) => `อัปเดตสถานะการสมัครงาน: ${status}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔔 อัปเดตสถานะการสมัคร</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>สถานะการสมัครของคุณสำหรับตำแหน่ง <strong>${data.jobTitle}</strong> มีการเปลี่ยนแปลง</p>

        <div style="background-color: ${data.statusColor}; padding: 20px; border-radius: 8px; 
                    margin: 20px 0; color: white; text-align: center;">
          <h3 style="margin: 0; font-size: 24px;">${data.statusLabel}</h3>
        </div>

        ${data.message ? `<p>${data.message}</p>` : ''}

        ${data.nextSteps ? `
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">ขั้นตอนถัดไป</h3>
            <p>${data.nextSteps}</p>
          </div>
        ` : ''}

        <p style="margin-top: 30px;">
          <a href="${data.trackUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ดูรายละเอียดเพิ่มเติม
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ<br>
          ติดต่อ: <a href="mailto:hr@company.com">hr@company.com</a>
        </p>
      </div>
    `,
  },

  // 3. เชิญเข้าสัมภาษณ์
  interviewInvitation: {
    subject: () => `เชิญเข้ารับการสัมภาษณ์งาน`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎉 ยินดีด้วย! คุณผ่านการคัดเลือกเบื้องต้น</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>เราขอเชิญคุณเข้ารับการสัมภาษณ์สำหรับตำแหน่ง <strong>${data.jobTitle}</strong></p>

        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; 
                    border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #16a34a;">📅 รายละเอียดการสัมภาษณ์</h3>
          <p><strong>วันที่:</strong> ${data.interviewDate}</p>
          <p><strong>เวลา:</strong> ${data.interviewTime}</p>
          <p><strong>สถานที่:</strong> ${data.location}</p>
          <p><strong>รูปแบบ:</strong> ${data.format}</p>
          ${data.interviewers ? `<p><strong>ผู้สัมภาษณ์:</strong> ${data.interviewers}</p>` : ''}
        </div>

        <h3>สิ่งที่ควรเตรียม</h3>
        <ul>
          <li>Resume ตัวจริง</li>
          <li>Portfolio (ถ้ามี)</li>
          <li>เอกสารประกอบอื่นๆ</li>
          <li>คำถามที่อยากถามบริษัท</li>
        </ul>

        ${data.meetingLink ? `
          <p style="margin-top: 30px;">
            <a href="${data.meetingLink}" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              เข้าร่วมการสัมภาษณ์ (Video Call)
            </a>
          </p>
        ` : ''}

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏰ หมายเหตุ:</strong> กรุณามาถึงก่อนเวลา 10-15 นาที</p>
        </div>

        <p style="margin-top: 30px;">
          <a href="${data.confirmUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ยืนยันการเข้าสัมภาษณ์
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          หากไม่สามารถมาได้ กรุณาติดต่อกลับภายใน 24 ชั่วโมง<br>
          ติดต่อ: <a href="mailto:hr@company.com">hr@company.com</a> | โทร: 02-XXX-XXXX
        </p>
      </div>
    `,
  },

  // 4. ได้รับข้อเสนองาน (Offer Letter)
  offerLetter: {
    subject: (jobTitle) => `ข้อเสนองาน: ${jobTitle}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎊 ยินดีด้วย! คุณได้รับข้อเสนองาน</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>เรายินดีที่จะเสนอตำแหน่งงาน <strong>${data.jobTitle}</strong> ให้กับคุณ</p>

        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📋 รายละเอียดข้อเสนองาน</h3>
          <p><strong>ตำแหน่ง:</strong> ${data.jobTitle}</p>
          <p><strong>แผนก:</strong> ${data.department}</p>
          <p><strong>เงินเดือน:</strong> ${data.salary}</p>
          <p><strong>วันเริ่มงาน:</strong> ${data.startDate}</p>
          <p><strong>ประเภทสัญญา:</strong> ${data.contractType}</p>
        </div>

        <h3>สวัสดิการ</h3>
        <ul>
          ${data.benefits?.map(b => `<li>${b}</li>`).join('') || '<li>ตามที่ระบุในเอกสาร</li>'}
        </ul>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">
            <strong>⏳ กรุณาตอบรับภายใน:</strong> ${data.responseDeadline}
          </p>
        </div>

        <p style="margin-top: 30px; text-align: center;">
          <a href="${data.acceptUrl}" 
             style="background-color: #16a34a; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 6px; display: inline-block; 
                    margin-right: 10px; font-weight: bold;">
            ตอบรับข้อเสนอ
          </a>
          <a href="${data.declineUrl}" 
             style="background-color: #dc2626; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ปฏิเสธข้อเสนอ
          </a>
        </p>

        <p>เอกสารข้อเสนองานฉบับเต็มแนบมาพร้อมอีเมลนี้</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          หากมีข้อสงสัย กรุณาติดต่อ: <a href="mailto:hr@company.com">hr@company.com</a>
        </p>
      </div>
    `,
  },

  // 5. ไม่ผ่านการคัดเลือก
  applicationRejected: {
    subject: () => `ขอบคุณสำหรับความสนใจ`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b7280;">ขอบคุณสำหรับความสนใจ</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>ขอบคุณที่สนใจและสมัครงานกับเราในตำแหน่ง <strong>${data.jobTitle}</strong></p>

        <p>หลังจากพิจารณาอย่างรอบคอบแล้ว เราขอแจ้งว่าในครั้งนี้เราเลือกผู้สมัครท่านอื่นที่มีคุณสมบัติตรงกับความต้องการของตำแหน่งมากกว่า</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">
            เราขอให้กำลังใจคุณในการหางานต่อไป และหวังว่าจะได้มีโอกาสพิจารณาใบสมัครของคุณอีกครั้งในอนาคต
          </p>
        </div>

        <p>คุณสามารถติดตามตำแหน่งงานใหม่ๆ ได้ที่:</p>
        <p style="margin-top: 20px;">
          <a href="${data.jobsUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ดูตำแหน่งงานอื่นๆ
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          ขอบคุณอีกครั้งสำหรับเวลาและความสนใจของคุณ<br>
          ทีม HR
        </p>
      </div>
    `,
  },

  // 6. แจ้งเตือน HR: มีใบสมัครใหม่
  newApplicationNotification: {
    subject: (jobTitle) => `[HR] มีใบสมัครใหม่: ${jobTitle}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📬 มีใบสมัครใหม่</h2>
        <p>สวัสดี HR Team,</p>
        <p>มีผู้สมัครใหม่สำหรับตำแหน่ง <strong>${data.jobTitle}</strong></p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">ข้อมูลผู้สมัคร</h3>
          <p><strong>ชื่อ:</strong> ${data.candidateName}</p>
          <p><strong>Email:</strong> ${data.candidateEmail}</p>
          <p><strong>เบอร์โทร:</strong> ${data.candidatePhone}</p>
          <p><strong>ตำแหน่ง:</strong> ${data.jobTitle}</p>
          <p><strong>วันที่สมัคร:</strong> ${data.submittedDate}</p>
          ${data.preScreeningScore ? `<p><strong>คะแนนเบื้องต้น:</strong> ${data.preScreeningScore}/100</p>` : ''}
        </div>

        <p style="margin-top: 30px;">
          <a href="${data.reviewUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ตรวจสอบใบสมัคร
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          ATS Notification System
        </p>
      </div>
    `,
  },

  // 7. แจ้งเตือน HM: มีผู้สมัครรอประเมิน
  pendingEvaluationNotification: {
    subject: (count) => `[HM] คุณมีผู้สมัคร ${count} คนรอการประเมิน`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⏳ มีผู้สมัครรอการประเมิน</h2>
        <p>สวัสดีคุณ ${data.managerName},</p>
        <p>คุณมีผู้สมัครรอการประเมิน <strong>${data.applicantCount} คน</strong></p>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">รายการรอประเมิน</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.applicants?.map(app => `
              <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <strong>${app.name}</strong> - ${app.position}
                <br><small style="color: #6b7280;">รอมาแล้ว ${app.waitingDays} วัน</small>
              </li>
            `).join('') || ''}
          </ul>
        </div>

        <p style="margin-top: 30px;">
          <a href="${data.reviewUrl}" 
             style="background-color: #f59e0b; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ไปหน้าประเมิน
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          ATS Notification System
        </p>
      </div>
    `,
  },
};

/**
 * Email Service
 * ส่ง email ผ่าน SendGrid
 */
import { sendEmail as sendEmailViaProvider } from './emailProvider';

export class EmailService {
  constructor() {
    // ไม่ต้องส่ง API key เข้ามา - ใช้จาก environment variables
  }

  /**
   * ส่ง email
   * @param {Object} options - ตัวเลือกการส่ง
   * @param {string} options.to - อีเมลผู้รับ
   * @param {string} options.subject - หัวข้อ
   * @param {string} options.html - เนื้อหา HTML
   * @param {Array} options.attachments - ไฟล์แนบ (optional)
   */
  async send({ to, subject, html, attachments = [] }) {
    try {
      const result = await sendEmailViaProvider({
        to,
        subject,
        html,
        from: 'ATS System <noreply@company.com>',
        attachments,
      });

      return result;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * ส่ง email เมื่อสมัครงานสำเร็จ
   */
  async sendApplicationSubmitted(data) {
    const template = emailTemplates.applicationSubmitted;
    await this.send({
      to: data.candidateEmail,
      subject: template.subject(data.jobTitle),
      html: template.html(data),
    });
  }

  /**
   * ส่ง email เมื่อสถานะเปลี่ยน
   */
  async sendStatusUpdate(data) {
    const template = emailTemplates.statusUpdate;
    await this.send({
      to: data.candidateEmail,
      subject: template.subject(data.statusLabel),
      html: template.html(data),
    });
  }

  /**
   * ส่ง email เชิญสัมภาษณ์
   */
  async sendInterviewInvitation(data) {
    const template = emailTemplates.interviewInvitation;
    await this.send({
      to: data.candidateEmail,
      subject: template.subject(),
      html: template.html(data),
    });
  }

  /**
   * ส่ง email ข้อเสนองาน
   */
  async sendOfferLetter(data) {
    const template = emailTemplates.offerLetter;
    await this.send({
      to: data.candidateEmail,
      subject: template.subject(data.jobTitle),
      html: template.html(data),
      attachments: data.offerDocument ? [{
        filename: 'offer-letter.pdf',
        path: data.offerDocument,
      }] : [],
    });
  }

  /**
   * ส่ง email ไม่ผ่านการคัดเลือก
   */
  async sendApplicationRejected(data) {
    const template = emailTemplates.applicationRejected;
    await this.send({
      to: data.candidateEmail,
      subject: template.subject(),
      html: template.html(data),
    });
  }

  /**
   * แจ้ง HR มีใบสมัครใหม่
   */
  async notifyHRNewApplication(data) {
    const template = emailTemplates.newApplicationNotification;
    await this.send({
      to: data.hrEmail,
      subject: template.subject(data.jobTitle),
      html: template.html(data),
    });
  }

  /**
   * แจ้ง HM มีผู้สมัครรอประเมิน
   */
  async notifyHMPendingEvaluation(data) {
    const template = emailTemplates.pendingEvaluationNotification;
    await this.send({
      to: data.managerEmail,
      subject: template.subject(data.applicantCount),
      html: template.html(data),
    });
  }
}

/**
 * ตัวอย่างการใช้งาน
 */

// สร้าง instance
// const emailService = new EmailService('your-api-key');

// ส่ง email สมัครงานสำเร็จ
// await emailService.sendApplicationSubmitted({
//   candidateEmail: 'john@example.com',
//   candidateName: 'John Doe',
//   jobTitle: 'Senior Frontend Developer',
//   department: 'Engineering',
//   submittedDate: '9 ตุลาคม 2568',
//   applicationId: 'APP-2024-001',
//   trackUrl: 'https://ats.company.com/track/APP-2024-001',
// });

// ส่ง email เชิญสัมภาษณ์
// await emailService.sendInterviewInvitation({
//   candidateEmail: 'john@example.com',
//   candidateName: 'John Doe',
//   jobTitle: 'Senior Frontend Developer',
//   interviewDate: '15 ตุลาคม 2568',
//   interviewTime: '14:00 - 15:00 น.',
//   location: 'ชั้น 5 ห้องประชุม A',
//   format: 'สัมภาษณ์แบบตัวต่อตัว',
//   interviewers: 'คุณสมชาย (Tech Lead), คุณสมหญิง (HR Manager)',
//   meetingLink: null, // หรือใส่ link ถ้าเป็น video call
//   confirmUrl: 'https://ats.company.com/confirm-interview/123',
// });

export default EmailService;
