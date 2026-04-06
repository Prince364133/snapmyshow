import { sendGAEvent } from '@next/third-parties/google';

/**
 * Utility to track custom GA4 events for ShowBook
 * @param eventName Name of the event
 * @param params Object containing event parameters
 */
export const trackGAEvent = (eventName: string, params: Record<string, any>) => {
  try {
    sendGAEvent({ event: eventName, value: params });
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA Event] ${eventName}:`, params);
    }
  } catch (error) {
    console.error('GA Event tracking failed:', error);
  }
};

export const GAEVENTS = {
  MOVIE_VIEW: 'movie_view',
  SHOWTIME_SELECTED: 'showtime_selected',
  SEATS_SELECTED: 'seats_selected',
  BOOKING_CONFIRMED: 'booking_confirmed',
  TICKET_DOWNLOADED: 'ticket_downloaded',
  QR_SCANNED: 'qr_scanned',
  PAYMENT_APPROVED: 'payment_approved',
};
