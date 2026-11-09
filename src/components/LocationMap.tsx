'use client';

import { useEffect, useRef } from 'react';
import { asset } from '@/lib/asset';
import { MAP_HEIGHT, MAP_PLACES, MAP_ROTATION, MAP_WIDTH, placeMapUrl, projectMap } from '@/lib/map';
import Icon from './Icon';

export default function LocationMap() {
    const viewport = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = viewport.current;
        if (!element) return;
        const position = projectMap(MAP_PLACES[0].latitude, MAP_PLACES[0].longitude);
        element.scrollLeft = Math.max(0, element.scrollWidth * position.x / MAP_WIDTH - element.clientWidth / 2);
    }, []);

    return (
        <figure className="location-map" data-reveal>
            <div className="map-viewport" ref={viewport} tabIndex={0} role="region" aria-label="Карта побережья. На узком экране листайте по горизонтали">
                <div className="map-canvas">
                    <img className="map-base" src={asset('/assets/maps/kurpati-coast.svg')} alt="Карта реального побережья от Гаспры до Ялты с дорогами, зданиями и парками" width={MAP_WIDTH} height={MAP_HEIGHT} loading="lazy" decoding="async" />
                    <svg className="map-orientation" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} fill="none" aria-hidden="true">
                        <g transform={`translate(110 115) rotate(${MAP_ROTATION})`} stroke="currentColor" strokeWidth="1.4">
                            <circle r="30" strokeDasharray="125 64" transform="rotate(-30)" />
                            <circle r="24" strokeDasharray="105 46" transform="rotate(-30)" />
                            <path d="M0 42V-48m-6 10 6-10 6 10" />
                        </g>
                        <text x="159" y="75" fill="currentColor" fontSize="16">С</text>
                        <g transform="translate(82 742)" stroke="currentColor" strokeWidth="1.5"><path d="M0-5v5h142v-5M71-5v5" /><text x="0" y="23" fill="currentColor" stroke="none" fontSize="13">0</text><text x="142" y="23" fill="currentColor" stroke="none" fontSize="13" textAnchor="end">1 км</text></g>
                        <text x="945" y="620" className="map-sea-name" fill="currentColor" textAnchor="middle">Чёрное море</text>
                    </svg>
                    {MAP_PLACES.map(place => {
                        const position = projectMap(place.latitude, place.longitude);
                        return <a className={`map-marker map-marker-${place.id}`} key={place.id} href={placeMapUrl(place)} target="_blank" rel="noreferrer" style={{ left: `${position.x / MAP_WIDTH * 100}%`, top: `${position.y / MAP_HEIGHT * 100}%` }} aria-label={`${place.name}. Открыть на карте`}><span className="map-marker-dot">{place.id === 'kurpati' ? <span /> : place.number}</span><span className="map-marker-label"><strong>{place.name}</strong><small>{place.detail}</small></span></a>;
                    })}
                </div>
            </div>
            <figcaption className="map-caption"><span>Побережье Большой Ялты</span><span className="map-scroll-hint">Листайте карту <Icon /></span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></figcaption>
            <div className="map-places">{MAP_PLACES.map(place => <a href={placeMapUrl(place)} key={place.id} target="_blank" rel="noreferrer"><span>{place.number}</span><div><strong>{place.name}</strong><small>{place.detail}</small></div><Icon /></a>)}</div>
        </figure>
    );
}
