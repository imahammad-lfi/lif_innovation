/**
 * Lead lifecycle:
 * - beforeCreate: give every enquiry a unique reference (LF-YYMMDD-XXXXX) unless one was supplied.
 * - afterCreate: send the visitor's thank-you email and the sales alert in the background, so the
 *   website's form response is not delayed by SMTP. The outcome is recorded on the lead
 *   (emailStatus / emailSentAt / emailError).
 */
import { makeReference, sendEnquiryEmails, type Lead } from '../../../../utils/enquiry-email';

type CreateEvent = { params: { data: Record<string, unknown> }; result?: Lead };

export default {
  beforeCreate(event: CreateEvent) {
    const data = event.params.data;
    if (!data.reference) data.reference = makeReference();
  },
  afterCreate(event: CreateEvent) {
    const lead = event.result;
    if (!lead?.email) return;
    const start = () =>
      setImmediate(() => {
        void sendEnquiryEmails(strapi, lead);
      });
    // The document service creates the lead inside a transaction. Start only after it commits, otherwise
    // the emailStatus update runs on another connection, cannot see the uncommitted row and is lost.
    // A nested transaction shares the outer commit callbacks, so onCommit fires after the real commit.
    if (strapi.db.inTransaction()) {
      void strapi.db.transaction(async ({ onCommit }) => {
        onCommit(start);
      });
    } else start();
  },
};
