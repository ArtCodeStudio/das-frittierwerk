import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import _contact from "../../../content/contact.yml";

interface ContactData {
  phone: string;
  address: string;
  hours: string;
  order_hint?: string;
  website?: string;
  email?: string;
  social?: {
    instagram?: string;
  };
  map: {
    latitude: number;
    longitude: number;
    zoom: number;
    marker_title: string;
  };
}

export class DfwContactComponent extends Component {
  public static tagName = "dfw-contact";

  protected autobind = true;

  private mapInitialized = false;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope = {
    contact: (_contact as unknown) as ContactData,
  };

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwContactComponent.observedAttributes);
  }

  protected async afterBind() {
    await super.afterBind();
    await this.initMap();
  }

  private async initMap() {
    if (this.mapInitialized) return;

    const mapContainer = this.querySelector('#contact-map') as HTMLElement;
    if (!mapContainer) return;

    const { Map, View } = await import('ol');
    const { default: TileLayer } = await import('ol/layer/Tile');
    const { default: OSM } = await import('ol/source/OSM');
    const { default: VectorLayer } = await import('ol/layer/Vector');
    const { default: VectorSource } = await import('ol/source/Vector');
    const { default: Feature } = await import('ol/Feature');
    const { default: Point } = await import('ol/geom/Point');
    const { fromLonLat } = await import('ol/proj');
    const { default: Style } = await import('ol/style/Style');
    const { default: Icon } = await import('ol/style/Icon');

    const { latitude, longitude, zoom } = this.scope.contact.map;
    const center = fromLonLat([longitude, latitude]);

    // Create marker
    const marker = new Feature({
      geometry: new Point(center),
    });

    // SVG marker icon in the restaurant's gold color
    const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32C32 7.2 24.8 0 16 0z" fill="%23c4913b"/>
      <circle cx="16" cy="16" r="8" fill="%231a0f0a"/>
      <circle cx="16" cy="16" r="5" fill="%23c4913b"/>
    </svg>`;

    marker.setStyle(new Style({
      image: new Icon({
        src: 'data:image/svg+xml,' + encodeURIComponent(markerSvg.replace(/%23/g, '#')),
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: 1,
      }),
    }));

    const vectorSource = new VectorSource({
      features: [marker],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    new Map({
      target: mapContainer,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center,
        zoom,
      }),
    });

    this.mapInitialized = true;
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected async template() {
    if (hasChildNodesTrim(this)) {
      return null;
    } else {
      const { default: template } = await import(
        "./dfw-contact.component.pug"
      );
      return template(this.scope);
    }
  }
}
