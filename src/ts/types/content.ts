export interface MarkdownContent {
  attributes?: {
    title?: string;
  };
  html?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryData {
  title?: string;
  images: GalleryImage[];
}

export interface DirectionsService {
  name: string;
  url: string;
  icon?: string;
}

export interface ContactData {
  title?: string;
  phone?: string;
  address?: string;
  hours?: string;
  location?: string;
  order_hint?: string;
  label_order_phone?: string;
  label_hours?: string;
  label_directions?: string;
  label_directions_button?: string;
  label_directions_modal_title?: string;
  label_directions_modal_text?: string;
  directions_url?: string;
  directions_services?: DirectionsService[];
}

export interface SiteData {
  name?: string;
  title?: string;
  short_name?: string;
  description?: string;
  hero_subtitle?: string;
  theme_color?: string;
  background_color?: string;
  display?: string;
  nav?: Record<string, string>;
  footer_order_text?: string;
  footer_hours_label?: string;
  footer_address_label?: string;
  footer_copyright?: string;
}

export interface MenuItem {
  name: string;
  price: number | string;
  description?: string;
  info?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  title?: string;
  categories: MenuCategory[];
}
