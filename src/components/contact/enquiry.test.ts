/**
 * The enquiry form's field contract, its payload, and the submission seam.
 *
 * The payload assertions carry the most weight: §19.3 forbids visitor-supplied
 * text from reaching the email subject, and the mechanism that guarantees it is
 * that `topic` and `regarding` leave the client as machine values matched
 * against a catalogue — never as strings someone typed or edited into a URL.
 */

import { describe, expect, it } from 'vitest';
import {
  ENQUIRY_ENDPOINT,
  FIELD_LIMITS,
  TOPIC_CHOICES,
  TOPIC_NOT_SURE,
  buildPayload,
  classifyResponse,
  hasErrors,
  isTopicChoice,
  toFormBody,
  validateEnquiry,
  validateField,
  type EnquiryValues,
} from './enquiry';
import type { PrefillService } from './prefill';

const SCANNING: PrefillService = {
  slug: 'scanare-3d',
  name: 'Scanare 3D',
  pillar: 'reality-capture',
};

const VALID: EnquiryValues = {
  name: 'Ana Popescu',
  email: 'ana@example.org',
  message: 'As vrea sa discutam despre un releveu.',
  topic: TOPIC_NOT_SURE,
};

describe('the field set is the frozen one (IA Step 7)', () => {
  it('offers exactly three Topic choices, "Not sure" among them', () => {
    expect(TOPIC_CHOICES).toEqual(['architecture-design', 'reality-capture', 'not-sure']);
    expect(isTopicChoice('not-sure')).toBe(true);
    expect(isTopicChoice('anything-else')).toBe(false);
  });

  it('posts to the endpoint the architecture names (§4)', () => {
    expect(ENQUIRY_ENDPOINT).toBe('/api/contact');
  });
});

describe('validation (UX only — §19.3)', () => {
  it('accepts a complete enquiry', () => {
    expect(validateEnquiry(VALID)).toEqual({});
    expect(hasErrors(validateEnquiry(VALID))).toBe(false);
  });

  it('requires name, email and message', () => {
    const errors = validateEnquiry({ name: '', email: '', message: '', topic: '' });
    expect(errors).toEqual({ name: 'required', email: 'required', message: 'required' });
  });

  it('treats whitespace as empty', () => {
    expect(validateField('name', '   ')).toBe('required');
    expect(validateField('message', '\n\t ')).toBe('required');
  });

  it('rejects an address with no plausible shape', () => {
    for (const value of ['ana', 'ana@', '@example.org', 'ana@example', 'a b@example.org']) {
      expect(validateField('email', value)).toBe('invalid');
    }
  });

  it('accepts addresses a stricter pattern would wrongly reject', () => {
    for (const value of ['a+tag@sub.example.co.uk', "o'brien@example.org", 'ana@exemplu.ro']) {
      expect(validateField('email', value)).toBeUndefined();
    }
  });

  it('enforces the caps it mirrors from the Function', () => {
    expect(validateField('name', 'a'.repeat(FIELD_LIMITS.name + 1))).toBe('tooLong');
    expect(validateField('message', 'a'.repeat(FIELD_LIMITS.message + 1))).toBe('tooLong');
    expect(validateField('name', 'a'.repeat(FIELD_LIMITS.name))).toBeUndefined();
  });

  it('imposes no minimum length beyond "not empty"', () => {
    expect(validateField('message', 'Scan a stairwell?')).toBeUndefined();
  });

  it('never reports the optional Topic selector', () => {
    const errors = validateEnquiry({ ...VALID, topic: 'tampered' });
    expect(errors).toEqual({});
  });
});

describe('the payload', () => {
  it('trims the visitor’s fields', () => {
    const payload = buildPayload(
      { ...VALID, name: '  Ana  ', email: ' ana@example.org ' },
      { regarding: null, locale: 'ro' },
    );
    expect(payload.name).toBe('Ana');
    expect(payload.email).toBe('ana@example.org');
  });

  it('sends "Not sure" as no topic at all', () => {
    const payload = buildPayload(VALID, { regarding: null, locale: 'ro' });
    expect(payload.topic).toBeNull();
    expect(payload.regarding).toBeNull();
  });

  it('carries a chosen pillar', () => {
    const payload = buildPayload(
      { ...VALID, topic: 'architecture-design' },
      { regarding: null, locale: 'ro' },
    );
    expect(payload.topic).toBe('architecture-design');
  });

  it('drops a tampered selector value rather than forwarding it', () => {
    const payload = buildPayload(
      { ...VALID, topic: 'urgent-please-read' },
      { regarding: null, locale: 'ro' },
    );
    expect(payload.topic).toBeNull();
  });

  it('takes Regarding from the resolved Service, and lets it decide the Topic', () => {
    const payload = buildPayload(
      { ...VALID, topic: 'architecture-design' },
      { regarding: SCANNING, locale: 'ro' },
    );
    expect(payload.regarding).toBe('scanare-3d');
    expect(payload.topic).toBe('reality-capture');
  });

  it('sends only machine values in the two routing fields (§19.3)', () => {
    const payload = buildPayload(
      { ...VALID, name: 'URGENT: read this', message: 'Subject: free money' },
      { regarding: SCANNING, locale: 'ro' },
    );
    /* Whatever the visitor typed stays in name/message; the fields the subject
       line is built from carry vocabulary values and nothing else. */
    expect(payload.topic).toBe('reality-capture');
    expect(payload.regarding).toBe('scanare-3d');
  });

  it('encodes one body shape for both the island and the no-JS POST', () => {
    const body = toFormBody(buildPayload(VALID, { regarding: null, locale: 'ro' }));
    expect(body.get('name')).toBe('Ana Popescu');
    expect(body.get('locale')).toBe('ro');
    /* Absent, not the string "null". */
    expect(body.has('topic')).toBe(false);
    expect(body.has('regarding')).toBe(false);
  });
});

describe('submission outcomes', () => {
  it('treats only 2xx as sent', () => {
    expect(classifyResponse(200)).toBe('sent');
    expect(classifyResponse(202)).toBe('sent');
    expect(classifyResponse(204)).toBe('sent');
  });

  it('treats a missing endpoint as unavailable, never as sent or as the visitor’s fault', () => {
    /* The pre-Phase-7 world: a static host answering a POST to a route that
       does not exist. */
    expect(classifyResponse(404)).toBe('unavailable');
    expect(classifyResponse(405)).toBe('unavailable');
    expect(classifyResponse(501)).toBe('unavailable');
    expect(classifyResponse(500)).toBe('unavailable');
    expect(classifyResponse(502)).toBe('unavailable');
  });

  it('treats a considered refusal as failed', () => {
    expect(classifyResponse(400)).toBe('failed');
    expect(classifyResponse(403)).toBe('failed');
    expect(classifyResponse(422)).toBe('failed');
    expect(classifyResponse(429)).toBe('failed');
  });

  it('has no outcome that reports a delivery nothing confirmed', () => {
    for (const status of [0, 301, 302, 400, 404, 500, 503]) {
      expect(classifyResponse(status)).not.toBe('sent');
    }
  });
});
