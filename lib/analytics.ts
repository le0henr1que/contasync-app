/**
 * Simple analytics helper for tracking user interactions
 * Can be extended to integrate with Google Analytics, Mixpanel, PostHog, etc.
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    // Enable analytics in production only
    this.enabled = process.env.NODE_ENV === 'production';
  }

  /**
   * Track a custom event
   */
  track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) {
      console.log('[Analytics - Dev]', event, properties);
      return;
    }

    const eventData: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    // Log to console (can be replaced with actual analytics service)
    console.log('[Analytics]', eventData);

    // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
    // Example with Google Analytics (gtag):
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', event, properties);
    // }

    // Example with Mixpanel:
    // if (typeof window !== 'undefined' && (window as any).mixpanel) {
    //   (window as any).mixpanel.track(event, properties);
    // }
  }

  /**
   * Track CTA click
   */
  trackCTAClick(source: string, destination: string, planSlug?: string) {
    this.track('cta_click', {
      source,
      destination,
      planSlug,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', {
      pageName,
      ...properties,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }

  /**
   * Track signup start
   */
  trackSignupStart(tenantType: 'INDIVIDUAL' | 'ACCOUNTANT_FIRM', planSlug?: string) {
    this.track('signup_start', {
      tenantType,
      planSlug,
    });
  }

  /**
   * Track signup complete
   */
  trackSignupComplete(
    tenantType: 'INDIVIDUAL' | 'ACCOUNTANT_FIRM',
    planSlug?: string,
    userId?: string
  ) {
    this.track('signup_complete', {
      tenantType,
      planSlug,
      userId,
    });
  }

  /**
   * Track plan selection
   */
  trackPlanSelect(planSlug: string, interval: 'monthly' | 'yearly', source: string) {
    this.track('plan_select', {
      planSlug,
      interval,
      source,
    });
  }
}

// Singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackCTAClick = analytics.trackCTAClick.bind(analytics);
export const trackPageView = analytics.trackPageView.bind(analytics);
export const trackSignupStart = analytics.trackSignupStart.bind(analytics);
export const trackSignupComplete = analytics.trackSignupComplete.bind(analytics);
export const trackPlanSelect = analytics.trackPlanSelect.bind(analytics);
