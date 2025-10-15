// Lightweight mock of email service used by the frontend when backend/email provider is not available
// Exports the same surface used in the app: EmailService class, emailTemplates and verifyEmailSetup

export const emailTemplates = {
  applicationSubmitted: {
    subject: (jobTitle) => `ยืนยันการสมัครงาน: ${jobTitle}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">✅ สมัครงานสำเร็จ</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>เราได้รับใบสมัครของคุณสำหรับตำแหน่ง <strong>${data.jobTitle}</strong> เรียบร้อยแล้ว</p>
        <p>เลขที่ใบสมัคร: ${data.applicationId}</p>
      </div>
    `,
  },

  statusUpdate: {
    subject: (status) => `อัปเดตสถานะการสมัครงาน: ${status}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔔 อัปเดตสถานะการสมัคร</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>สถานะการสมัครของคุณสำหรับตำแหน่ง <strong>${data.jobTitle}</strong> มีการเปลี่ยนแปลง</p>
      </div>
    `,
  },

  interviewInvitation: {
    subject: () => `เชิญเข้ารับการสัมภาษณ์งาน`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎉 ยินดีด้วย! คุณผ่านการคัดเลือกเบื้องต้น</h2>
        <p>สวัสดีคุณ ${data.candidateName},</p>
        <p>เราขอเชิญคุณเข้ารับการสัมภาษณ์สำหรับตำแหน่ง <strong>${data.jobTitle}</strong></p>
      </div>
    `,
  },

  offerLetter: {
    subject: (jobTitle) => `ข้อเสนองาน: ${jobTitle}`,
    html: (data) => `<p>ข้อเสนองานสำหรับ ${data.candidateName}</p>`,
  },

  applicationRejected: {
    subject: () => `ขอบคุณสำหรับความสนใจ`,
    html: (data) => `<p>เรียน ${data.candidateName}, ขอบคุณที่สมัคร</p>`,
  },

  newApplicationNotification: {
    subject: (jobTitle) => `[HR] มีใบสมัครใหม่: ${jobTitle}`,
    html: (data) => `<p>มีผู้สมัครใหม่สำหรับ ${data.jobTitle}</p>`,
  },

  pendingEvaluationNotification: {
    subject: (count) => `[HM] คุณมีผู้สมัคร ${count} คนรอการประเมิน`,
    html: (data) => `<p>มีผู้สมัครรอประเมิน</p>`,
  },
};

export class EmailService {
  constructor() {
    // noop
  }

  async send({ to, subject, html, attachments = [] }) {
    // Frontend mock: log and return success in test mode
    // Keep behavior consistent with previous provider (returns { success, messageId, mode })
    // eslint-disable-next-line no-console
    console.log('[email mock] send', { to, subject });
    return {
      success: true,
      messageId: 'mock-' + Date.now(),
      mode: 'test',
    };
  }

  async sendApplicationSubmitted(data) {
    const template = emailTemplates.applicationSubmitted;
    return this.send({
      to: data.candidateEmail,
      subject: typeof template.subject === 'function' ? template.subject(data.jobTitle) : template.subject,
      html: template.html(data),
    });
  }

  async sendStatusUpdate(data) {
    const template = emailTemplates.statusUpdate;
    return this.send({
      to: data.candidateEmail,
      subject: typeof template.subject === 'function' ? template.subject(data.statusLabel) : template.subject,
      html: template.html(data),
    });
  }

  async sendInterviewInvitation(data) {
    const template = emailTemplates.interviewInvitation;
    return this.send({
      to: data.candidateEmail,
      subject: typeof template.subject === 'function' ? template.subject() : template.subject,
      html: template.html(data),
    });
  }

  async sendOfferLetter(data) {
    const template = emailTemplates.offerLetter;
    return this.send({
      to: data.candidateEmail,
      subject: typeof template.subject === 'function' ? template.subject(data.jobTitle) : template.subject,
      html: template.html(data),
      attachments: data.offerDocument ? [{ filename: 'offer-letter.pdf', path: data.offerDocument }] : [],
    });
  }

  async sendApplicationRejected(data) {
    const template = emailTemplates.applicationRejected;
    return this.send({
      to: data.candidateEmail,
      subject: typeof template.subject === 'function' ? template.subject() : template.subject,
      html: template.html(data),
    });
  }

  async notifyHRNewApplication(data) {
    const template = emailTemplates.newApplicationNotification;
    return this.send({
      to: data.hrEmail,
      subject: typeof template.subject === 'function' ? template.subject(data.jobTitle) : template.subject,
      html: template.html(data),
    });
  }

  async notifyHMPendingEvaluation(data) {
    const template = emailTemplates.pendingEvaluationNotification;
    return this.send({
      to: data.managerEmail,
      subject: typeof template.subject === 'function' ? template.subject(data.applicantCount) : template.subject,
      html: template.html(data),
    });
  }
}

export async function verifyEmailSetup() {
  // Always report test-mode in the frontend mock
  return {
    configured: false,
    message: 'Email provider not configured (frontend mock)',
    mode: 'test',
  };
}

export default EmailService;
