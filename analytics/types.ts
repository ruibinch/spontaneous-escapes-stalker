export interface Session {
  session_id: string;
  website_id: string;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  subdivision1?: string;
  subdivision2?: string;
  city?: string;
  created_at?: string;
}

export interface WebsiteEvent {
  event_id: string;
  website_id: string;
  session_id: string;
  created_at?: string;
  url_path: string;
  url_query?: string;
  referrer_path?: string;
  referrer_query?: string;
  referrer_domain?: string;
  page_title?: string;
  event_type: 1 | 2;
  event_name?: string;
  visit_id: string;
}
